import { Router } from 'express';

import {
  solicitarCaeController,
  ultimoComprobanteController,
} from '../controllers/wsfe.controller';

import {
  authMiddleware,
} from '../middlewares/auth.middleware';

import {
  rateLimitPorCuitYFactura,
} from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authMiddleware);

router.post(
  '/solicitar-cae',
  rateLimitPorCuitYFactura,
  solicitarCaeController
);

router.get(
  '/ultimo-comprobante',
  ultimoComprobanteController
);

export default router;