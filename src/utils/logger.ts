// Tất cả log phải ra stderr — stdout dành riêng cho JSON-RPC
const timestamp = () => new Date().toISOString()
const createLog = (type: "INFO" | "WARN" | "ERROR" | "DEBUG", msg: string, data?: unknown, err?: unknown) => ({
  logType: type,
  timestamp: timestamp(),
  msg,
  data,
  err
})
export const logger = {
  info: (msg: string, data?: unknown) => {

    process.stderr.write(JSON.stringify(createLog("INFO", msg, data)) + '\n')
  },
  warn: (msg: string, data?: unknown) => {
    process.stderr.write(JSON.stringify(createLog("WARN", msg, data)) + '\n')
  },
  error: (msg: string, err?: unknown) => {
    const errStr = err instanceof Error ? err.message : JSON.stringify(err)
    process.stderr.write(JSON.stringify(createLog("ERROR", msg, errStr)) + '\n')
  },
  debug: (msg: string, data?: unknown) => {
    if (process.env.DEBUG) {
      process.stderr.write(JSON.stringify(createLog("DEBUG", msg, data)) + '\n')
    }
  },
}