import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../services/logger';

const logger = createLogger('CSRF');

// Configuración básica de CSRF
export const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware para manejar errores de CSRF
export const handleCSRFError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Log del error CSRF
  logger.warn('Invalid CSRF token', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent']
  });

  // Enviar respuesta de error
  res.status(403).json({
    error: 'Invalid CSRF token',
    message: 'Form tampered with'
  });
};

// Middleware para proporcionar el token CSRF al frontend
export const sendCSRFToken = (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
};

// Lista de rutas que no requieren CSRF
export const csrfExemptPaths = [
  '/api/webhook/stripe',
  '/api/webhook/instagram',
  '/api/health'
];

// Middleware para aplicar CSRF selectivamente
export const conditionalCSRF = (req: Request, res: Response, next: NextFunction) => {
  if (csrfExemptPaths.includes(req.path)) {
    next();
  } else {
    csrfProtection(req, res, next);
  }
}; 