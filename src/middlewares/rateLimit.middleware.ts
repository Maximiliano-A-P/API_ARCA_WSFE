import {
  Request,
  Response,
  NextFunction,
} from 'express';

import {
  wsfeConfig,
} from '../config/wsfe.config';

interface RegistroCuit {
  cantidad: number;
  inicioVentana: number;
}

const registros =
  new Map<string, RegistroCuit>();

export function rateLimitPorCuit(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  const cuit =
    req.body?.cuit;

  /*
   * Si no hay CUIT todavía, dejamos pasar.
   *
   * La validación definitiva la realiza Zod
   * posteriormente en el controller.
   */
  if (!cuit) {
    next();
    return;
  }

  const ahora =
    Date.now();

  const registro =
    registros.get(cuit);

  /*
   * No existe una ventana anterior
   * o la ventana actual ya expiró.
   */
  if (
    !registro
    ||
    ahora - registro.inicioVentana
      > wsfeConfig.rateLimitVentanaMs
  ) {

    registros.set(
      cuit,
      {
        cantidad: 1,
        inicioVentana: ahora,
      }
    );

    next();
    return;
  }

  /*
   * La CUIT alcanzó el máximo de solicitudes
   * permitido dentro de la ventana.
   */
  if (
    registro.cantidad
      >= wsfeConfig.rateLimitMaxRequests
  ) {

    console.warn(
      `[RATE LIMIT] CUIT ${cuit} excedió el límite de `
      + `${wsfeConfig.rateLimitMaxRequests} solicitudes `
      + `en ${wsfeConfig.rateLimitVentanaMs} ms`
    );

    res.status(429).json({
      exito: false,

      errores: [
        {
          codigo: 'RATE_LIMIT',

          mensaje:
            'Demasiadas solicitudes, intentá de nuevo en un momento',
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