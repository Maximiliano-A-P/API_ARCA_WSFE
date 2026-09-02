import { Request, Response } from 'express';

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    exito: false,
    errores: [{ codigo: 'NOT_FOUND', mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` }],
  });
}