import { Router } from 'express';
import { resetWsfeClient } from '../soap/wsfeClient';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/reset-soap-client', (_req, res) => {
  resetWsfeClient();
  res.json({ exito: true, mensaje: 'Cliente SOAP reiniciado' });
});

export default router;