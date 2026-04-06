import createMollieClient, { MollieClient } from "@mollie/api-client";

let _mollieClient: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  if (!_mollieClient) {
    _mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY!,
    });
  }
  return _mollieClient;
}

export const mollieClient = new Proxy({} as MollieClient, {
  get(_target, prop) {
    return (getMollieClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
