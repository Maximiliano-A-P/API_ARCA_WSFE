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
    throw new Error(
      `Falta la variable de entorno: ${key}`
    );
  }

  return value;
}

export const wsfeConfig: WsfeConfig = {
  wsdlUrl:
    getEnvOrThrow('WSFE_WSDL_URL'),

  /*
   * Render proporciona PORT mediante variable
   * de entorno.
   *
   * Usamos 10000 solamente como fallback local.
   */
  port:
    Number(process.env.PORT) || 10000,

  internalApiKey:
    getEnvOrThrow('INTERNAL_API_KEY'),

  /*
   * Rate limit exclusivo para reintentos automáticos.
   *
   * 8 minutos = 480000 ms.
   */
  rateLimitVentanaMs:
  Number(
    process.env.RATE_LIMIT_VENTANA_MS
  ) || 480_000,

  /*
   * Una solicitud automática por factura
   * dentro de la ventana.
   */
  rateLimitMaxRequests:
    Number(
      process.env.RATE_LIMIT_MAX_REQUESTS
    ) || 1,
};