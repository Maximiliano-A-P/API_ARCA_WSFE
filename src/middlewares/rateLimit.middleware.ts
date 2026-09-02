import { Request, Response, NextFunction } from 'express';
import { wsfeConfig } from '../config/wsfe.config';

interface RegistroCuit {
  cantidad: number;
  inicioVentana: number;
}

const registros = new Map<string, RegistroCuit>();

export function rateLimitPorCuit(req: Request, res: Response, next: NextFunction) {
  const cuit = req.body?.cuit;

  // Si no hay CUIT todavía (ej: body vacío), dejamos pasar — Zod lo va a rechazar después igual
  if (!cuit) {
    return next();
  }

  const ahora = Date.now();
  const registro = registros.get(cuit);

  if (!registro || ahora - registro.inicioVentana > wsfeConfig.rateLimitVentanaMs) {
    registros.set(cuit, { cantidad: 1, inicioVentana: ahora });
    return next();
  }

  if (registro.cantidad >= wsfeConfig.rateLimitMaxRequests) {
    return res.status(429).json({
      exito: false,
      errores: [{ codigo: 'RATE_LIMIT', mensaje: 'Demasiadas solicitudes, intentá de nuevo en un momento' }],
    });
  }

  registro.cantidad++;
  next();
}