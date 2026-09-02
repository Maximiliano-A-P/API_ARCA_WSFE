import { FacturaRequest } from '../dto/facturaRequest.schema';
import { FacturaBuilder, FeCAEDetRequest } from './facturaBuilder.interface';
import { construirCamposComunes } from './camposComunes';

export class FacturaSinIvaBuilder implements FacturaBuilder {
  build(dto: FacturaRequest, numeroComprobante: number): FeCAEDetRequest {
    const detalle = construirCamposComunes(dto, numeroComprobante);

    // Factura C: no lleva array Iva, el importe de IVA es 0
    detalle.ImpIVA = 0;

    return detalle;
  }
}