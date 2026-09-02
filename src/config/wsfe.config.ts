import dotenv from 'dotenv';

dotenv.config();

interface WsfeConfig {
  wsdlUrl: string;
  port: number;
  internalApiKey: string;
  rateLimitVentanaMs: number;
  rateLimitMaxRequests: number;
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${key}`);
  }
  return value;
}

export const wsfeConfig: WsfeConfig = {
  wsdlUrl: getEnvOrThrow('WSFE_WSDL_URL'),
  port: Number(process.env.PORT) || 3000,
  internalApiKey: getEnvOrThrow('INTERNAL_API_KEY'),
  rateLimitVentanaMs: Number(process.env.RATE_LIMIT_VENTANA_MS) || 60_000,
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
};