import { getWsfeClient } from '../soap/wsfeClient';
import { facturaRequestSchema, FacturaRequest } from '../dto/facturaRequest.schema';
import { getFacturaBuilder } from '../builders/facturaBuilder.factory';
import { consultarUltimoComprobante } from './consultarUltimoComprobante.service';
import { normalizeWsfeResponse, CaeResponse } from './normalizeWsfeResponse';

export async function solicitarCae(raw: unknown): Promise<CaeResponse> {
  // 1. Validar el request con Zod (tira ZodError si algo no cierra)
  const dto: FacturaRequest = facturaRequestSchema.parse(raw);

  // 2. Averiguar qué número de comprobante corresponde
  const numeroComprobante = await consultarUltimoComprobante({
    token: dto.token,
    sign: dto.sign,
    cuit: dto.cuit,
    puntoVenta: dto.puntoVenta,
    tipoComprobante: dto.tipoComprobante,
  });

  // 3. Elegir el builder correcto según el tipo de comprobante
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

  // 5. Normalizar la respuesta
  return normalizeWsfeResponse(result, numeroComprobante);
}