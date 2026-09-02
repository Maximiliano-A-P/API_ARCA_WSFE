import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { solicitarCae } from '../services/solicitarCae.service';
import { logger } from '../utils/logger';
import { consultarUltimoComprobante } from '../services/consultarUltimoComprobante.service';

export async function solicitarCaeController(req: Request, res: Response) {
  const cuit = req.body?.cuit;

  try {
    logger.info('Solicitando CAE', { cuit, tipoComprobante: req.body?.tipoComprobante });

    const resultado = await solicitarCae(req.body);

    if (resultado.exito) {
      logger.info('CAE otorgado', { cuit, cae: resultado.cae });
    } else {
      logger.warn('CAE rechazado', { cuit, errores: resultado.errores });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Error de validación', { cuit, detalle: error.errors });
      return res.status(400).json({
        exito: false,
        errores: error.errors.map(e => ({
          codigo: 'VALIDACION',
          mensaje: `${e.path.join('.')}: ${e.message}`,
        })),
      });
    }

    logger.error('Error interno en solicitarCae', { cuit, mensaje: (error as Error).message });
    return res.status(500).json({
      exito: false,
      errores: [{ codigo: 'ERROR_INTERNO', mensaje: (error as Error).message }],
    });
  }
}

export async function ultimoComprobanteController(req: Request, res: Response) {
  const { token, sign, cuit, puntoVenta, tipoComprobante } = req.query;

  try {
    if (!token || !sign || !cuit || !puntoVenta || !tipoComprobante) {
      return res.status(400).json({
        exito: false,
        errores: [{ codigo: 'VALIDACION', mensaje: 'Faltan parámetros: token, sign, cuit, puntoVenta, tipoComprobante' }],
      });
    }

    const proximoNumero = await consultarUltimoComprobante({
      token: token as string,
      sign: sign as string,
      cuit: cuit as string,
      puntoVenta: Number(puntoVenta),
      tipoComprobante: Number(tipoComprobante),
    });

    logger.info('Consulta de próximo comprobante', { cuit: cuit as string, proximoNumero });

    return res.status(200).json({ exito: true, proximoNumero });
  } catch (error) {
    logger.error('Error consultando último comprobante', { cuit: cuit as string, mensaje: (error as Error).message });
    return res.status(500).json({
      exito: false,
      errores: [{ codigo: 'ERROR_INTERNO', mensaje: (error as Error).message }],
    });
  }
}