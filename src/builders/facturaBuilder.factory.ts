import { FacturaBuilder } from './facturaBuilder.interface';
import { FacturaConIvaBuilder } from './facturaConIva.builder';
import { FacturaSinIvaBuilder } from './facturaSinIva.builder';
import { FacturaExportacionBuilder } from './facturaExportacion.builder';
import { discriminaIva, esExportacion } from '../config/comprobantes.catalog';

export function getFacturaBuilder(tipoComprobante: number): FacturaBuilder {
  if (esExportacion(tipoComprobante)) {
    return new FacturaExportacionBuilder();
  }

  if (discriminaIva(tipoComprobante)) {
    return new FacturaConIvaBuilder();
  }

  return new FacturaSinIvaBuilder();
}