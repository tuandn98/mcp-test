import z from "zod";

import type { ToolResponse } from "../tools/definitions/definition_type";
import { err, ok } from "./response";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
export interface ApiEnvelope<T> {
  error: boolean;
  message: string;
  data: T;
}

export class ApiFetchError extends Error {
  public readonly url: string;
  public readonly method: HttpMethod;
  public readonly status?: number;
  public readonly requestId?: string;
  public readonly responseBody?: string;

  constructor(args: {
    message: string;
    url: string;
    method: HttpMethod;
    status?: number;
    requestId?: string;
    responseBody?: string;
    cause?: unknown;
  }) {
    super(args.message);
    this.name = "ApiFetchError";
    this.url = args.url;
    this.method = args.method;
    this.status = args.status;
    this.requestId = args.requestId;
    this.responseBody = args.responseBody;
    if (args.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        value: args.cause,
        enumerable: false,
        configurable: true,
      });
    }
  }
}

export type RetryableStatus = number;

export interface ApiFetchOptions<T> {
  /**
   * Optional base URL used when `url` is a relative path.
   * Example: `https://api.example.com/v1`.
   */
  baseUrl?: string;

  /**
   * HTTP method. Default: `GET`.
   */
  method?: HttpMethod;

  /**
   * Additional request headers.
   * Defaults:
   * - `accept: application/json`
   * - If `body` is set, `content-type: application/json` is added
   *   unless provided explicitly.
   */
  headers?: Record<string, string>;

  /**
   * Query string values appended to the URL.
   */
  query?: Record<string, string | number | boolean | undefined>;

  /**
   * Request body serialized with `JSON.stringify`.
   */
  body?: unknown;

  /**
   * Request timeout in milliseconds. Default: 15000.
   */
  timeoutMs?: number;

  /**
   * Retry count for retryable failures (timeouts/network errors/retryable status codes).
   * Default: 0.
   */
  retries?: number;

  /**
   * Base backoff delay in milliseconds. Default: 300.
   * Formula: `retryDelayMs * 2^attempt`.
   */
  retryDelayMs?: number;

  /**
   * Retryable status codes. Default: `429, 500, 502, 503, 504`.
   */
  retriesOnStatus?: RetryableStatus[];

  /**
   * Optional Zod schema to validate parsed JSON response.
   */
  schema?: z.ZodType<T>;

  /**
   * Optional external abort signal.
   */
  signal?: AbortSignal;

  /**
   * Optional request identifier for logs and errors.
   */
  requestId?: string;
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function joinBaseUrlAndPath(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function resolveUrl(urlOrPath: string, baseUrl?: string): string {
  if (isAbsoluteUrl(urlOrPath)) return urlOrPath;
  if (!baseUrl) {
    throw new ApiFetchError({
      message: `Relative path "${urlOrPath}" requires a baseUrl`,
      url: urlOrPath,
      method: "GET",
    });
  }
  return joinBaseUrlAndPath(baseUrl, urlOrPath);
}

function buildUrlWithQuery(
  url: string,
  query: ApiFetchOptions<unknown>["query"],
): string {
  if (!query || Object.keys(query).length === 0) return url;
  // `URL` expects an absolute URL string.
  const u = new URL(url);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    u.searchParams.set(key, String(value));
  }
  return u.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJsonOrThrow(args: {
  url: string;
  method: HttpMethod;
  status?: number;
  responseText: string;
  requestId?: string;
  responseBody?: string;
}): Promise<unknown> {
  const { responseText, url, method, status, requestId, responseBody } = args;
  const trimmed = responseText.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch (cause) {
    throw new ApiFetchError({
      message: `Invalid JSON response from ${method} ${url}`,
      url,
      method,
      status,
      requestId,
      responseBody: responseBody ?? responseText,
      cause,
    });
  }
}

function withAbortTimeout(args: {
  timeoutMs: number;
  signal?: AbortSignal;
}): { controller: AbortController; clear: () => void } {
  const controller = new AbortController();
  const { timeoutMs, signal } = args;

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const abortHandler = () => controller.abort();

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abortHandler, { once: true });
  }

  return {
    controller,
    clear: () => {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener("abort", abortHandler);
    },
  };
}

/**
 * Reusable fetch wrapper for JSON APIs.
 *
 * Features:
 * - timeout support
 * - controlled retries
 * - JSON parsing + optional Zod validation
 * - normalized `ApiFetchError` on failures
 */
export async function apiFetch<T>(url: string, options: ApiFetchOptions<T>): Promise<T> {
  const method = (options.method ?? "GET") as HttpMethod;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const retries = options.retries ?? 0;
  const retryDelayMs = options.retryDelayMs ?? 300;
  const retriesOnStatus = options.retriesOnStatus ?? [429, 500, 502, 503, 504];

  const requestId = options.requestId;

  const resolvedUrl = resolveUrl(url, options.baseUrl);
  const finalUrl = buildUrlWithQuery(resolvedUrl, options.query);

  const mergedHeaders: Record<string, string> = {
    accept: "application/json",
    ...options.headers,
  };

  const hasContentType = Object.keys(mergedHeaders).some((k) => k.toLowerCase() === "content-type");
  const hasBody = options.body !== undefined;

  let body: string | undefined;
  if (hasBody) {
    if (!hasContentType) mergedHeaders["content-type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  // Retry loop with inclusive upper bound: 0..retries.
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const startedAt = Date.now();

    const { controller, clear } = withAbortTimeout({
      timeoutMs,
      signal: options.signal,
    });

    try {
      const res = await fetch(finalUrl, {
        method,
        headers: mergedHeaders,
        body,
        signal: controller.signal,
      });

      const durationMs = Date.now() - startedAt;
      const responseText = await res.text();
      const status = res.status;

      if (!res.ok) {
        const isRetryable = retriesOnStatus.includes(status) && attempt < retries;
        const err = new ApiFetchError({
          message: `API responded with ${status} (${res.statusText}) for ${method} ${finalUrl}`,
          url: finalUrl,
          method,
          status,
          requestId,
          responseBody: responseText,
        });
        if (isRetryable) {
          await sleep(retryDelayMs * 2 ** attempt);
          continue;
        }

        throw err;
      }

      const parsed = await parseJsonOrThrow({
        url: finalUrl,
        method,
        status,
        requestId,
        responseText,
      });

      if (options.schema) {
        // Validate contract to keep runtime and TypeScript in sync.
        return options.schema.parse(parsed);
      }

      // If no schema is provided, caller owns runtime correctness.
      return parsed as T;
    } catch (cause) {
      const durationMs = Date.now() - startedAt;
      lastError = cause;

      const isAbort = cause instanceof Error && (cause.name === "AbortError" || cause.message.includes("aborted"));
      const shouldRetry =
        attempt < retries &&
        (isAbort ||
          // Network/transport errors are retryable by default.
          !(cause instanceof ApiFetchError) ||
          (cause instanceof ApiFetchError && cause.status !== undefined && retriesOnStatus.includes(cause.status)));

      if (shouldRetry) {
        await sleep(retryDelayMs * 2 ** attempt);
        continue;
      }

      if (cause instanceof ApiFetchError) throw cause;
      throw new ApiFetchError({
        message: `Failed to call API ${method} ${finalUrl}`,
        url: finalUrl,
        method,
        requestId,
        cause,
      });
    } finally {
      clear();
    }
  }

  // Safety fallback for strict control flow.
  throw lastError instanceof Error
    ? lastError
    : new ApiFetchError({
        message: `Failed to call API ${method} ${finalUrl}`,
        url: finalUrl,
        method,
        requestId,
      });
}

export interface ApiFetchEnvelopeOptions<T> extends Omit<ApiFetchOptions<ApiEnvelope<T>>, "schema"> {
  /**
   * Optional schema for validating the `data` field.
   */
  dataSchema?: z.ZodType<T>;
}

interface ApiClientDefaults {
  /**
   * Fixed API endpoint, for example `https://api.example.com/v1`.
   */
  baseUrl: string;

  /**
   * Default options applied to every request.
   * Per-call options always override defaults.
   */
  defaults?: Omit<ApiFetchOptions<unknown>, "baseUrl" | "schema">;
}

/**
 * Create a reusable API client with a fixed base URL.
 * Then you only pass relative paths (for example `/orders`).
 */
export function createApiFetch(config: ApiClientDefaults) {
  const { baseUrl, defaults } = config;

  /**
   * Fetch API response where the remote contract is:
   * `{ error: boolean, message: string, data: T }`.
   *
   * This function is intentionally small:
   * - validates the envelope shape
   * - converts `{ error: true }` into `err(message)`
   * - returns `ok(data)` for success
   */
  return async function fetchData<T>(
    path: string,
    options: ApiFetchEnvelopeOptions<T> = {},
  ): Promise<ToolResponse> {
    const mergedOptions: ApiFetchEnvelopeOptions<T> = {
      ...(defaults ?? {}),
      ...options,
      baseUrl,
      headers: {
        ...((defaults?.headers as Record<string, string> | undefined) ?? {}),
        ...(options.headers ?? {}),
      },
    };

    const envelopeSchema = z.object({
      error: z.boolean(),
      message: z.string(),
      data: mergedOptions.dataSchema ?? z.unknown(),
    }) as z.ZodType<ApiEnvelope<T>>;

    try {
      const envelope = await apiFetch<ApiEnvelope<T>>(path, {
        ...mergedOptions,
        schema: envelopeSchema,
      });

      return envelope.error ? err(envelope.message, envelope) : ok(envelope.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return err(message, e);
    }
  };
}

