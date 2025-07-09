import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'logs';

// Configuración de formatos
const formats = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Rotación de archivos de log
const fileRotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Transporte para errores
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

// Crear logger base
const baseLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: formats,
  transports: [
    fileRotateTransport,
    errorFileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Función para crear loggers específicos por módulo
export function createLogger(module: string) {
  return {
    debug: (message: string, meta?: any) => {
      baseLogger.debug({ message, module, ...(meta || {}) });
    },
    info: (message: string, meta?: any) => {
      baseLogger.info({ message, module, ...(meta || {}) });
    },
    warn: (message: string, meta?: any) => {
      baseLogger.warn({ message, module, ...(meta || {}) });
    },
    error: (message: string, error?: any) => {
      baseLogger.error({
        message,
        module,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          ...error
        } : error
      });
    }
  };
}

// Logger para peticiones HTTP
export const httpLogger = createLogger('HTTP');

// Middleware para logging de peticiones HTTP
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpLogger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  next();
}; 