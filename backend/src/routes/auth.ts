import { Router, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { bruteForce, createAccountLimiter } from '../middleware/rateLimit';
import { twoFactorService } from '../services/twoFactor';
import { createLogger } from '../services/logger';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('AuthRoutes');

// Esquemas de validación
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', bruteForce.prevent, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, token } = req.body;

    // Verificar credenciales básicas primero
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Si 2FA está habilitado, verificar el token
    if (user.twoFactorEnabled) {
      if (!token) {
        return res.status(403).json({
          error: '2FA required',
          requires2FA: true
        });
      }

      const isValid = await twoFactorService.verifyToken(user.id, token);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    // Generar token JWT
    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    logger.error('Error in login', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// POST /api/auth/register - Registrar usuario
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CLIENT', // Por defecto es cliente
      },
    });

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me - Obtener información del usuario autenticado
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Rutas de 2FA
router.post('/2fa/setup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.user;
    const secret = await twoFactorService.generateSecret(userId);
    res.json(secret);
  } catch (error) {
    logger.error('Error setting up 2FA', error);
    res.status(500).json({ error: 'Error setting up 2FA' });
  }
});

router.post('/2fa/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const isValid = await twoFactorService.verifyToken(userId, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error verifying 2FA token', error);
    res.status(500).json({ error: 'Error verifying token' });
  }
});

router.post('/2fa/enable', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const enabled = await twoFactorService.enable2FA(userId, token);
    if (!enabled) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generar códigos de respaldo cuando se activa 2FA
    const backupCodes = await twoFactorService.generateBackupCodes(userId);

    res.json({ success: true, backupCodes });
  } catch (error) {
    logger.error('Error enabling 2FA', error);
    res.status(500).json({ error: 'Error enabling 2FA' });
  }
});

router.post('/2fa/disable', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const disabled = await twoFactorService.disable2FA(userId, token);
    if (!disabled) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error disabling 2FA', error);
    res.status(500).json({ error: 'Error disabling 2FA' });
  }
});

router.post('/2fa/backup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.user;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Backup code is required' });
    }

    const isValid = await twoFactorService.verifyBackupCode(userId, code);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid backup code' });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error verifying backup code', error);
    res.status(500).json({ error: 'Error verifying backup code' });
  }
});

export default router; 