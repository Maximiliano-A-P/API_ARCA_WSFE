import express, {
  Request,
  Response,
  NextFunction,
} from 'express';

import cors from 'cors';
import path from 'path';

import { wsfeConfig } from './config/wsfe.config';

import wsfeRoutes from './routes/wsfe.routes';
import adminRoutes from './routes/admin.routes';

import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware';

const app = express();

/*
 * ==========================================================
 * CONFIGURACIÓN BÁSICA
 * ==========================================================
 */

app.use(cors());

app.use(express.json());

app.use(
  express.static(
    path.join(
      __dirname,
      '..',
      'public'
    )
  )
);

/*
 * ==========================================================
 * LOG DE TODAS LAS PETICIONES HTTP
 * ==========================================================
 *
 * Permite comprobar si una petición realmente
 * llegó a nuestra aplicación Express.
 */

app.use(
  (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {

    console.log(
      `[HTTP] ${req.method} ${req.originalUrl}`
    );

    next();
  }
);

/*
 * ==========================================================
 * RUTAS WSFE
 * ==========================================================
 */

app.use(
  '/wsfe',
  wsfeRoutes
);

/*
 * ==========================================================
 * RUTAS ADMIN
 * ==========================================================
 */

app.use(
  '/admin',
  adminRoutes
);

/*
 * ==========================================================
 * HEALTH CHECK
 * ==========================================================
 */

app.get(
  '/health',
  (
    _req: Request,
    res: Response
  ): void => {

    res.json({
      status: 'ok',
    });
  }
);

/*
 * ==========================================================
 * 404
 * ==========================================================
 */

app.use(
  notFoundMiddleware
);

/*
 * ==========================================================
 * MANEJADOR DE ERRORES
 * ==========================================================
 */

app.use(
  errorHandlerMiddleware
);

/*
 * ==========================================================
 * SERVIDOR
 * ==========================================================
 *
 * Render proporciona la variable PORT.
 *
 * Escuchamos en 0.0.0.0 para que Render pueda acceder
 * correctamente al servicio.
 */

app.listen(
  wsfeConfig.port,
  '0.0.0.0',
  (): void => {

    console.log(
      `arca-api corriendo en 0.0.0.0:${wsfeConfig.port}`
    );
  }
);