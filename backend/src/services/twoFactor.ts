import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { createLogger } from './logger';
import { PrismaClient } from '@prisma/client';

const logger = createLogger('2FA');
const prisma = new PrismaClient();

export class TwoFactorService {
  // Generar secreto para 2FA
  async generateSecret(userId: string) {
    try {
      const secret = speakeasy.generateSecret({
        name: `MT Guide (${userId})`
      });

      // Guardar el secreto en la base de datos
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret.base32,
          twoFactorEnabled: false // Se activará cuando el usuario verifique
        }
      });

      // Generar QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

      logger.info('2FA secret generated', { userId });

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl
      };
    } catch (error) {
      logger.error('Error generating 2FA secret', error);
      throw new Error('Error generating 2FA secret');
    }
  }

  // Verificar código 2FA
  async verifyToken(userId: string, token: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
      });

      if (!user?.twoFactorSecret) {
        logger.warn('2FA secret not found for user', { userId });
        return false;
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1 // Permite 1 intervalo de tiempo antes/después
      });

      if (verified) {
        logger.info('2FA token verified successfully', { userId });
      } else {
        logger.warn('Invalid 2FA token attempt', { userId });
      }

      return verified;
    } catch (error) {
      logger.error('Error verifying 2FA token', error);
      throw new Error('Error verifying 2FA token');
    }
  }

  // Activar 2FA para un usuario
  async enable2FA(userId: string, token: string): Promise<boolean> {
    try {
      const isValid = await this.verifyToken(userId, token);

      if (isValid) {
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: true }
        });
        logger.info('2FA enabled for user', { userId });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error enabling 2FA', error);
      throw new Error('Error enabling 2FA');
    }
  }

  // Desactivar 2FA para un usuario
  async disable2FA(userId: string, token: string): Promise<boolean> {
    try {
      const isValid = await this.verifyToken(userId, token);

      if (isValid) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
          }
        });
        logger.info('2FA disabled for user', { userId });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error disabling 2FA', error);
      throw new Error('Error disabling 2FA');
    }
  }

  // Generar códigos de respaldo
  async generateBackupCodes(userId: string): Promise<string[]> {
    try {
      const codes = Array.from({ length: 10 }, () =>
        speakeasy.generateSecret({ length: 10 }).base32.slice(0, 10)
      );

      // Guardar códigos hasheados en la base de datos
      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: codes
        }
      });

      logger.info('Backup codes generated for user', { userId });
      return codes;
    } catch (error) {
      logger.error('Error generating backup codes', error);
      throw new Error('Error generating backup codes');
    }
  }

  // Verificar código de respaldo
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { backupCodes: true }
      });

      if (!user?.backupCodes?.includes(code)) {
        logger.warn('Invalid backup code attempt', { userId });
        return false;
      }

      // Eliminar el código usado
      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: {
            set: user.backupCodes.filter(c => c !== code)
          }
        }
      });

      logger.info('Backup code used successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Error verifying backup code', error);
      throw new Error('Error verifying backup code');
    }
  }
}

export const twoFactorService = new TwoFactorService(); 