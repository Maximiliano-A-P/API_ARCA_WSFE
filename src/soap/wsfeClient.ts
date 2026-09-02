import * as soap from 'soap';
import { wsfeConfig } from '../config/wsfe.config';

let cachedClient: soap.Client | null = null;

export async function getWsfeClient(): Promise<soap.Client> {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await soap.createClientAsync(wsfeConfig.wsdlUrl);
  cachedClient = client;
  return cachedClient;
}

export function resetWsfeClient(): void {
  cachedClient = null;
}