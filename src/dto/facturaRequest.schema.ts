import { z } from 'zod';

import {
  esNotaCreditoODebito,
  discriminaIva,
  esExportacion,
} from '../config/comprobantes.catalog';

const alicuotaIvaSchema = z.object({
  id: z.number(),
  baseImp: z.number(),
  importe: z.number(),
});

const comprobanteAsociadoSchema = z.object({
  tipo: z.number(),
  puntoVenta: z.number(),
  numero: z.number(),
});

const baseSchema = z.object({
  /*
   * Identificación interna de la factura
   * dentro de Laravel.
   */
  invoiceId:
    z.number()
      .int()
      .positive(),

  /*
   * true solamente cuando la solicitud proviene
   * del proceso automático de reintentos.
   *
   * Inicial y manual = false.
   */
  reintentoAutomatico:
    z.boolean()
      .default(false),

  // credenciales que vienen de Laravel
  token: z.string(),
  sign: z.string(),
  cuit: z.string(),

  // datos del comprobante
  puntoVenta: z.number(),
  tipoComprobante: z.number(),
  concepto: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),

  // datos del receptor
  docTipo: z.number(),
  docNro: z.string(),
  condicionIvaReceptorId: z.number(),

  // fecha e importes
  fecha: z.string().length(8),
  importeTotal: z.number(),
  importeNeto: z.number(),
  importeIva: z.number().optional(),

  // campos que solo aplican según el tipo
  alicuotasIva:
    z.array(alicuotaIvaSchema)
      .optional(),

  comprobantesAsociados:
    z.array(comprobanteAsociadoSchema)
      .optional(),

  fchServDesde:
    z.string()
      .length(8)
      .optional(),

  fchServHasta:
    z.string()
      .length(8)
      .optional(),

  fchVtoPago:
    z.string()
      .length(8)
      .optional(),

  // moneda
  monedaId:
    z.string()
      .optional(),

  monedaCotizacion:
    z.number()
      .optional(),

  // exportación
  paisDestino:
    z.number()
      .optional(),

  permisosEmbarque:
    z.array(
      z.object({
        idPermiso: z.string(),
        destino: z.number(),
      })
    ).optional(),
});

export const facturaRequestSchema =
  baseSchema.superRefine((data, ctx) => {

    /*
     * Concepto 2 (servicios) o 3 (productos y servicios)
     * requiere fechas de servicio.
     */
    if (data.concepto !== 1) {
      if (
        !data.fchServDesde
        ||
        !data.fchServHasta
        ||
        !data.fchVtoPago
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fchServDesde'],
          message:
            'Concepto servicios/ambos requiere '
            + 'fchServDesde, fchServHasta y fchVtoPago',
        });
      }
    }

    /*
     * Notas de crédito/débito deben referenciar
     * el comprobante original.
     */
    if (
      esNotaCreditoODebito(data.tipoComprobante)
      &&
      !data.comprobantesAsociados?.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comprobantesAsociados'],
        message:
          'Notas de crédito/débito requieren '
          + 'comprobantesAsociados',
      });
    }

    /*
     * Factura A/M discrimina IVA.
     */
    if (
      discriminaIva(data.tipoComprobante)
      &&
      !data.alicuotasIva?.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alicuotasIva'],
        message:
          'Este tipo de comprobante requiere '
          + 'discriminar IVA (alicuotasIva)',
      });
    }

    /*
     * Exportación requiere moneda extranjera.
     */
    if (
      esExportacion(data.tipoComprobante)
      &&
      (
        !data.monedaId
        ||
        !data.monedaCotizacion
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monedaId'],
        message:
          'Comprobantes de exportación requieren '
          + 'monedaId y monedaCotizacion',
      });
    }

    /*
     * Exportación requiere país destino.
     */
    if (
      esExportacion(data.tipoComprobante)
      &&
      !data.paisDestino
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paisDestino'],
        message:
          'Comprobantes de exportación requieren '
          + 'paisDestino',
      });
    }

    /*
    * Coherencia de importes para comprobantes que manejan IVA: A, B y M.
    */
    if (
      discriminaIva(data.tipoComprobante)
    ) {

      if (
        data.importeIva === undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['importeIva'],
          message:
            'Los comprobantes A, B y M requieren importeIva.',
        });
      }

      const iva =
        data.importeIva ?? 0;

      const totalEsperado =
        Math.round(
          (
            data.importeNeto
            + iva
          ) * 100
        ) / 100;

      const diferencia =
        Math.abs(
          data.importeTotal
          - totalEsperado
        );

      if (diferencia > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['importeTotal'],
          message:
            'Para este tipo de comprobante, importeTotal debe ser igual a importeNeto + importeIva.',
        });
      }

      /*
      * Si hay IVA informado, su detalle también debe coincidir con importeIva.
      */
      if (
        iva > 0
        && !data.alicuotasIva?.length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['alicuotasIva'],
          message:
            'Cuando importeIva es mayor que 0 debe informarse alicuotasIva.',
        });
      }

      if (
        data.alicuotasIva?.length
      ) {

        const sumaIva =
          data.alicuotasIva.reduce(
            (suma, item) =>
              suma + item.importe,
            0
          );

        const diferenciaIva =
          Math.abs(
            sumaIva - iva
          );

        if (
          diferenciaIva > 0.01
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['alicuotasIva'],
            message:
              'La suma de los importes de alicuotasIva debe coincidir con importeIva.',
          });
        }
      }
    }

    /*
    * Factura C:
    *
    * ImpIVA = 0
    * no se informa IVA
    * ImpTotal = ImpNeto + ImpTrib
    *
    * Esta API no recibe ImpTrib, por lo que ImpTotal debe ser igual a ImpNeto.
    */
    if (
      [11, 12, 13]
        .includes(data.tipoComprobante)
    ) {

      if (
        (data.importeIva ?? 0) !== 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['importeIva'],
          message:
            'Los comprobantes C deben informar importeIva igual a 0.',
        });
      }

      if (
        data.alicuotasIva?.length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['alicuotasIva'],
          message:
            'Los comprobantes C no deben informar alicuotasIva.',
        });
      }

      if (
        Math.abs(
          data.importeTotal
          - data.importeNeto
        ) > 0.01
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['importeTotal'],
          message:
            'Para comprobantes C, importeTotal debe coincidir con importeNeto.',
        });
      }
    }
  });

export type FacturaRequest =
  z.infer<typeof baseSchema>;