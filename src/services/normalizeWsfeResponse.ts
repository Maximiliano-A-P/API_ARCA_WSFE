export interface CaeResponse {
  exito: boolean;
  cae?: string;
  caeVencimiento?: string;
  numeroComprobante?: number;
  errores?: { codigo: string; mensaje: string }[];
  observaciones?: { codigo: string; mensaje: string }[];
}

function normalizarLista(item: any): any[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export function normalizeWsfeResponse(
  result: any,
  numeroComprobante: number
): CaeResponse {
  const respuesta = result?.FECAESolicitarResult;
  const cabecera = respuesta?.FeCabResp;
  const detalle = normalizarLista(respuesta?.FeDetResp?.FECAEDetResponse)[0];

  const erroresGenerales = normalizarLista(respuesta?.Errors?.Err).map((e: any) => ({
    codigo: String(e.Code),
    mensaje: e.Msg,
  }));

  const observaciones = normalizarLista(detalle?.Observaciones?.Obs).map((o: any) => ({
    codigo: String(o.Code),
    mensaje: o.Msg,
  }));

  // Resultado "A" = Aprobado, "R" = Rechazado, "P" = Parcial (a nivel cabecera)
  // A nivel detalle también viene un Resultado individual
  const aprobado =
    cabecera?.Resultado === 'A' && detalle?.Resultado === 'A' && !erroresGenerales.length;

  if (!aprobado) {
    return {
      exito: false,
      numeroComprobante,
      errores: erroresGenerales.length
        ? erroresGenerales
        : [{ codigo: 'RECHAZADO', mensaje: 'ARCA rechazó el comprobante' }],
      observaciones: observaciones.length ? observaciones : undefined,
    };
  }

  return {
    exito: true,
    cae: detalle.CAE,
    caeVencimiento: detalle.CAEFchVto,
    numeroComprobante,
    observaciones: observaciones.length ? observaciones : undefined,
  };
}