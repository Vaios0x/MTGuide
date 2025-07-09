import rateLimit from 'express-rate-limit';
import ExpressBrute from 'express-brute';
import { createLogger } from '../services/logger';
import { cacheService } from '../services/cache';

const logger = createLogger('RateLimit');

// Store para Express Brute usando Redis
const RedisStore = require('express-brute-redis');
const store = new RedisStore({
  client: cacheService['client']
});

// Configuración para intentos de login
export const bruteForce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutos
  maxWait: 60 * 60 * 1000, // 1 hora
  failCallback: (req: any, res: any, next: any, nextValidRequestDate: Date) => {
    logger.warn('Demasiados intentos de login fallidos', {
      ip: req.ip,
      nextValidRequestDate
    });
    res.status(429).json({
      error: 'Demasiados intentos fallidos',
      nextValidRequestDate
    });
  }
});

// Límite general de API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Demasiadas peticiones, por favor intente más tarde'
    });
  }
});

// Límite para endpoints públicos
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Demasiadas peticiones, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

// Límite para creación de cuentas
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // límite de 5 cuentas por hora
  message: 'Demasiados intentos de crear cuenta, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    logger.warn('Intento excesivo de creación de cuentas', {
      ip: req.ip
    });
    res.status(429).json({
      error: 'Demasiados intentos de crear cuenta'
    });
  }
});

// Límite para endpoints de contacto
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 mensajes por hora
  message: 'Demasiados mensajes enviados, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

// Límite para endpoints de pago
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos por 15 minutos
  message: 'Demasiados intentos de pago, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    logger.warn('Demasiados intentos de pago', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Demasiados intentos de pago'
    });
  }
}); 