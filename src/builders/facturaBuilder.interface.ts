import { FacturaRequest } from '../dto/facturaRequest.schema';

export interface FeCAEDetRequest {
  Concepto: number;
  DocTipo: number;
  DocNro: string;
  CbteDesde: number;
  CbteHasta: number;
  CbteFch: string;
  ImpTotal: number;
  ImpNeto: number;
  ImpIVA?: number;
  ImpTotConc?: number;
  ImpOpEx?: number;
  ImpTrib?: number;
  MonId: string;
  MonCotiz: number;
  CondicionIVAReceptorId: number;
  Iva?: {
    Id: number;
    BaseImp: number;
    Importe: number;
  }[];
  CbtesAsoc?: {
    Tipo: number;
    PtoVta: number;
    Nro: number;
  }[];
  FchServDesde?: string;
  FchServHasta?: string;
  FchVtoPago?: string;
  PaisDstCmp?: number;
  Permisos?: {
    Id_Permiso: string;
    Dst_merc: number;
  }[];
}

export interface FacturaBuilder {
  build(dto: FacturaRequest, numeroComprobante: number): FeCAEDetRequest;
}