export class ComprobanteNoSoportadoError extends Error {
  constructor(public readonly tipoComprobante: number) {
    super(
      'Los comprobantes E no se procesan mediante WSFEV1. ' +
      'ARCA utiliza WSFEXV1 para comprobantes de exportación.'
    );

    this.name = 'ComprobanteNoSoportadoError';
  }
}
