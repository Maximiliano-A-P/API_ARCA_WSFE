import { getWsfeClient } from '../soap/wsfeClient';
import { facturaRequestSchema, FacturaRequest } from '../dto/facturaRequest.schema';
import { getFacturaBuilder } from '../builders/facturaBuilder.factory';
import { consultarUltimoComprobante } from './consultarUltimoComprobante.service';
import { normalizeWsfeResponse, CaeResponse } from './normalizeWsfeResponse';
import { esExportacion } from '../config/comprobantes.catalog';
import { ComprobanteNoSoportadoError } from '../errors/comprobanteNoSoportado.error';

export async function solicitarCae(raw: unknown): Promise<CaeResponse> {
  /*
   * Comprobantes E:
   *
   * WSFEV1 no los procesa.
   * ARCA utiliza WSFEXV1 para exportación.
   *
   * La comprobación se hace antes de cualquier
   * consulta a ARCA.
   */
  if (typeof raw === 'object' && raw !== null) {
    const tipoComprobante = (raw as { tipoComprobante?: unknown }).tipoComprobante;

    if (typeof tipoComprobante === 'number' && esExportacion(tipoComprobante)) {
      throw new ComprobanteNoSoportadoError(tipoComprobante);
    }
  }

  // 1. Validar el request con Zod
  const dto: FacturaRequest = facturaRequestSchema.parse(raw);

  // 2. Averiguar qué número de comprobante corresponde
  const numeroComprobante = await consultarUltimoComprobante({
    token: dto.token,
    sign: dto.sign,
    cuit: dto.cuit,
    puntoVenta: dto.puntoVenta,
    tipoComprobante: dto.tipoComprobante,
  });

  // 3. Elegir el builder correcto según el tipo
  const builder = getFacturaBuilder(dto.tipoComprobante);
  const detalle = builder.build(dto, numeroComprobante);

  // 4. Llamar a WSFE
  const client = await getWsfeClient();

  const [result] = await client.FECAESolicitarAsync({
    Auth: {
      Token: dto.token,
      Sign: dto.sign,
      Cuit: dto.cuit,
    },
    FeCAEReq: {
      FeCabReq: {
        CantReg: 1,
        PtoVta: dto.puntoVenta,
        CbteTipo: dto.tipoComprobante,
      },
      FeDetReq: {
        FECAEDetRequest: [detalle],
      },
    },
  });

  // 5. Normalizar respuesta
  return normalizeWsfeResponse(result, numeroComprobante);
}