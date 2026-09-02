import { Request, Response, NextFunction } from 'express';

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error no capturado:', err);

  res.status(500).json({
    exito: false,
    errores: [{ codigo: 'ERROR_INTERNO', mensaje: 'Error interno del servidor' }],
  });
}