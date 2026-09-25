import {
  Request,
  Response,
  NextFunction,
} from 'express';

import {
  wsfeConfig,
} from '../config/wsfe.config';

interface RegistroFactura {
  cantidad: number;
  inicioVentana: number;
}

const registros =
  new Map<string, RegistroFactura>();

export function rateLimitPorCuitYFactura(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  /*
   * El límite solamente aplica a reintentos automáticos.
   *
   * Las solicitudes iniciales y los reintentos manuales
   * pasan sin consumir la ventana del rate limit.
   */
  const automatico =
    req.body?.reintentoAutomatico === true;

  if (!automatico) {
    next();
    return;
  }

  const cuit =
    req.body?.cuit;

  const invoiceId =
    req.body?.invoiceId;

  /*
   * Si faltan estos datos, dejamos pasar para que
   * el esquema Zod haga la validación correspondiente
   * y devuelva el error de forma normal.
   */
  if (!cuit || invoiceId === undefined || invoiceId === null) {
    next();
    return;
  }

  const clave =
    `${String(cuit).trim()}:${String(invoiceId).trim()}`;

  const ahora =
    Date.now();

  const registro =
    registros.get(clave);

  /*
   * No existe una ventana anterior
   * o la ventana actual ya expiró.
   */
  if (
    !registro
    ||
    ahora - registro.inicioVentana
      >= wsfeConfig.rateLimitVentanaMs
  ) {

    registros.set(
      clave,
      {
        cantidad: 1,
        inicioVentana: ahora,
      }
    );

    next();
    return;
  }

  /*
   * La combinación CUIT + factura alcanzó
   * el máximo permitido dentro de la ventana.
   */
  if (
    registro.cantidad
      >= wsfeConfig.rateLimitMaxRequests
  ) {

    const tiempoRestanteMs =
      wsfeConfig.rateLimitVentanaMs
      - (ahora - registro.inicioVentana);

    const tiempoRestanteSegundos =
      Math.max(
        1,
        Math.ceil(tiempoRestanteMs / 1000)
      );

    console.warn(
      `[RATE LIMIT] CUIT ${cuit}, factura ${invoiceId} `
      + `excedió el límite de `
      + `${wsfeConfig.rateLimitMaxRequests} solicitud(es) `
      + `en ${wsfeConfig.rateLimitVentanaMs} ms`
    );

    res.setHeader(
      'Retry-After',
      tiempoRestanteSegundos
    );

    res.status(429).json({
      exito: false,

      errores: [
        {
          codigo: 'RATE_LIMIT',

          mensaje:
            'El reintento automático de esta factura '
            + 'fue limitado temporalmente',
        },
      ],
    });

    return;
  }

  /*
   * Todavía hay solicitudes disponibles
   * dentro de la ventana actual.
   */
  registro.cantidad++;

  next();
}