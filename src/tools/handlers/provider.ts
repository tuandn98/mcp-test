import { ok, safe } from "../../utils/response";
import { fetchGraphqlApi } from "./helper";

const PROVIDER_INFO_QUERY = `
query getResourceAccount($address: TronAddress) {
  user(address: $address) {
    caller
    address
    balance
    info {
        createdBotCount
        contacts {
            type
            contactId
            isActive
            isVerify
            username
        }
        whitelistLevel
        userRefCode
        sponsor
        pendingRefCode
        totalRef
        totalPendingRef
        totalRefBonus
        remainRefBonus
        rank
    }
  }
}
`;
const USER_GET_SIGNATURE_QUERY = `
mutation getUserSignature($privateKey: String!, $message: String!) {
    users {
        getSignature(privateKey: $privateKey, message: $message)
    }
}
`;

export const getProviderInfoHandler = safe(async (input: Record<string, any>) => {
    const privateKeyRaw = process.env['PRIVATE_KEY']?.trim();
    if (!privateKeyRaw) {
        throw new Error(`Missing required env var: PRIVATE_KEY`);
    }
    const normalizedPrivateKey = privateKeyRaw.startsWith("0x")
        ? privateKeyRaw
        : `0x${privateKeyRaw}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const response = await fetchGraphqlApi(USER_GET_SIGNATURE_QUERY, { privateKey: normalizedPrivateKey, message: timestamp }) as any;
    const signature = response.data?.users?.getSignature;
    console.log({timestamp, signature});
    
    const getProviderInfoResponse = await fetchGraphqlApi(PROVIDER_INFO_QUERY, {}, { authorization: signature }) as any;
    const providerInfo = getProviderInfoResponse;
    console.log(providerInfo);
    return ok(providerInfo.data.user ?? {});
});
