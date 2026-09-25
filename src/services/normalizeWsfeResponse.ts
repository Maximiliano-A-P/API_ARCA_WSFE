export interface CaeResponse {
  exito: boolean;
  cae?: string;
  caeVencimiento?: string;
  numeroComprobante?: number;
  errores?: {
    codigo: string;
    mensaje: string;
  }[];
  observaciones?: {
    codigo: string;
    mensaje: string;
  }[];
}

function normalizarLista(item: any): any[] {
  if (!item) {
    return [];
  }

  return Array.isArray(item) ? item : [item];
}

export function normalizeWsfeResponse(
  result: any,
  numeroComprobante: number
): CaeResponse {
  const respuesta = result?.FECAESolicitarResult;

  const cabecera = respuesta?.FeCabResp;

  const detalle = normalizarLista(
    respuesta?.FeDetResp?.FECAEDetResponse
  )[0];

  const erroresGenerales = normalizarLista(
    respuesta?.Errors?.Err
  ).map((e: any) => ({
    codigo: String(e.Code),
    mensaje: String(e.Msg),
  }));

  const observaciones = normalizarLista(
    detalle?.Observaciones?.Obs
  ).map((o: any) => ({
    codigo: String(o.Code),
    mensaje: String(o.Msg),
  }));

  const aprobado =
    cabecera?.Resultado === 'A' &&
    detalle?.Resultado === 'A' &&
    erroresGenerales.length === 0;

  if (!aprobado) {
    let errores: {
      codigo: string;
      mensaje: string;
    }[];

    if (erroresGenerales.length > 0) {
      errores = erroresGenerales;
    } else if (observaciones.length > 0) {
      errores = observaciones;
    } else {
      errores = [
        {
          codigo: 'RECHAZADO',
          mensaje: 'ARCA rechazó el comprobante',
        },
      ];
    }

    return {
      exito: false,
      numeroComprobante,
      errores,
      observaciones:
        observaciones.length > 0
          ? observaciones
          : undefined,
    };
  }

  return {
    exito: true,
    cae: detalle?.CAE,
    caeVencimiento: detalle?.CAEFchVto,
    numeroComprobante,
    observaciones:
      observaciones.length > 0
        ? observaciones
        : undefined,
  };
}