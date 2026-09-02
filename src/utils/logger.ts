type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  cuit?: string;
  [key: string]: unknown;
}

function formatLog(level: LogLevel, mensaje: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const cuitTag = context?.cuit ? `[CUIT:${context.cuit}]` : '';
  const extra = context ? JSON.stringify(context) : '';
  return `${timestamp} [${level.toUpperCase()}]${cuitTag} ${mensaje} ${extra}`;
}

export const logger = {
  info(mensaje: string, context?: LogContext) {
    console.log(formatLog('info', mensaje, context));
  },
  warn(mensaje: string, context?: LogContext) {
    console.warn(formatLog('warn', mensaje, context));
  },
  error(mensaje: string, context?: LogContext) {
    console.error(formatLog('error', mensaje, context));
  },
};