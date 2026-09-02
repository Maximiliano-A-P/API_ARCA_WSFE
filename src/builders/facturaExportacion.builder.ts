import { FacturaRequest } from '../dto/facturaRequest.schema';
import { FacturaBuilder, FeCAEDetRequest } from './facturaBuilder.interface';
import { construirCamposComunes } from './camposComunes';

export class FacturaExportacionBuilder implements FacturaBuilder {
  build(dto: FacturaRequest, numeroComprobante: number): FeCAEDetRequest {
    const detalle = construirCamposComunes(dto, numeroComprobante);

    // Exportación no discrimina IVA
    detalle.ImpIVA = 0;
    detalle.PaisDstCmp = dto.paisDestino;

    if (dto.permisosEmbarque?.length) {
      detalle.Permisos = dto.permisosEmbarque.map(p => ({
        Id_Permiso: p.idPermiso,
        Dst_merc: p.destino,
      }));
    }

    return detalle;
  }
}