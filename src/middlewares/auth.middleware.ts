import { Request, Response, NextFunction } from 'express';
import { wsfeConfig } from '../config/wsfe.config';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('X-Internal-Api-Key');

  if (!apiKey || apiKey !== wsfeConfig.internalApiKey) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  next();
}