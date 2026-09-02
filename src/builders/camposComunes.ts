import { FacturaRequest } from '../dto/facturaRequest.schema';
import { FeCAEDetRequest } from './facturaBuilder.interface';

export function construirCamposComunes(
  dto: FacturaRequest,
  numeroComprobante: number
): FeCAEDetRequest {
  const detalle: FeCAEDetRequest = {
    Concepto: dto.concepto,
    DocTipo: dto.docTipo,
    DocNro: dto.docNro,
    CbteDesde: numeroComprobante,
    CbteHasta: numeroComprobante,
    CbteFch: dto.fecha,
    ImpTotal: dto.importeTotal,
    ImpNeto: dto.importeNeto,
    MonId: dto.monedaId ?? 'PES',
    MonCotiz: dto.monedaCotizacion ?? 1,
    CondicionIVAReceptorId: dto.condicionIvaReceptorId,
  };

  // Concepto 2 o 3 → agregar fechas de servicio
  if (dto.concepto !== 1) {
    detalle.FchServDesde = dto.fchServDesde;
    detalle.FchServHasta = dto.fchServHasta;
    detalle.FchVtoPago = dto.fchVtoPago;
  }

  // Notas de crédito/débito → agregar comprobantes asociados
  if (dto.comprobantesAsociados?.length) {
    detalle.CbtesAsoc = dto.comprobantesAsociados.map(c => ({
      Tipo: c.tipo,
      PtoVta: c.puntoVenta,
      Nro: c.numero,
    }));
  }

  return detalle;
}