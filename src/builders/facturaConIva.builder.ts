import { FacturaRequest } from '../dto/facturaRequest.schema';
import { FacturaBuilder, FeCAEDetRequest } from './facturaBuilder.interface';
import { construirCamposComunes } from './camposComunes';

export class FacturaConIvaBuilder implements FacturaBuilder {
  build(dto: FacturaRequest, numeroComprobante: number): FeCAEDetRequest {
    const detalle = construirCamposComunes(dto, numeroComprobante);

    detalle.ImpIVA = dto.importeIva ?? 0;
    detalle.Iva = (dto.alicuotasIva ?? []).map(a => ({
      Id: a.id,
      BaseImp: a.baseImp,
      Importe: a.importe,
    }));

    return detalle;
  }
}