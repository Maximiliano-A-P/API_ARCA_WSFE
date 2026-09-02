export const TIPOS_COMPROBANTE = {
  FACTURA_A: 1,
  NOTA_DEBITO_A: 2,
  NOTA_CREDITO_A: 3,
  FACTURA_B: 6,
  NOTA_DEBITO_B: 7,
  NOTA_CREDITO_B: 8,
  FACTURA_C: 11,
  NOTA_DEBITO_C: 12,
  NOTA_CREDITO_C: 13,
  FACTURA_M: 51,
  NOTA_DEBITO_M: 52,
  NOTA_CREDITO_M: 53,
  FACTURA_E: 19,
  NOTA_DEBITO_E: 20,
  NOTA_CREDITO_E: 21,
} as const;

export type CbteTipo = typeof TIPOS_COMPROBANTE[keyof typeof TIPOS_COMPROBANTE];

export const LETRA_POR_TIPO: Record<number, 'A' | 'B' | 'C' | 'M' | 'E'> = {
  1: 'A', 2: 'A', 3: 'A',
  6: 'B', 7: 'B', 8: 'B',
  11: 'C', 12: 'C', 13: 'C',
  51: 'M', 52: 'M', 53: 'M',
  19: 'E', 20: 'E', 21: 'E',
};

export function esNotaCreditoODebito(tipo: number): boolean {
  return [2, 3, 7, 8, 12, 13, 20, 21, 52, 53].includes(tipo);
}

export function discriminaIva(tipo: number): boolean {
  const letra = LETRA_POR_TIPO[tipo];
  return letra === 'A' || letra === 'M';
}

export function esExportacion(tipo: number): boolean {
  return [19, 20, 21].includes(tipo);
}