import { createApiFetch } from "../../utils/apiFetch";

const getBaseUrl = () => {
    return process.env.NETWORK === 'mainnet' ? 'https://api.tronsave.io' : 'https://api-dev.tronsave.io'
}
export const fetchApi = createApiFetch({
    baseUrl: getBaseUrl(),
    defaults: {
      headers: {
        apikey: process.env.API_KEY || '',
      },
    },
  });