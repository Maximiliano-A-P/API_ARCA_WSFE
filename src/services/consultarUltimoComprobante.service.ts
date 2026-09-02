import { getWsfeClient } from '../soap/wsfeClient';

interface ConsultarUltimoComprobanteParams {
  token: string;
  sign: string;
  cuit: string;
  puntoVenta: number;
  tipoComprobante: number;
}

export async function consultarUltimoComprobante(
  params: ConsultarUltimoComprobanteParams
): Promise<number> {
  const client = await getWsfeClient();

  const [result] = await client.FECompUltimoAutorizadoAsync({
    Auth: {
      Token: params.token,
      Sign: params.sign,
      Cuit: params.cuit,
    },
    PtoVta: params.puntoVenta,
    CbteTipo: params.tipoComprobante,
  });

  const respuesta = result?.FECompUltimoAutorizadoResult;

  if (respuesta?.Errors) {
    const errores = respuesta.Errors.Err ?? [];
    const mensajes = Array.isArray(errores) ? errores : [errores];
    throw new Error(
      `Error consultando último comprobante: ${mensajes.map((e: any) => e.Msg).join(', ')}`
    );
  }

  const ultimoNumero = respuesta?.CbteNro ?? 0;
  return ultimoNumero + 1;
}