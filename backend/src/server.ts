import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { requestLogger } from './services/logger';
import { performanceMonitor } from './middleware/monitor';
import { cacheService } from './services/cache';
import { storageService } from './services/storage';
import cookieParser from 'cookie-parser';
import { generalLimiter } from './middleware/rateLimit';
import { conditionalCSRF, handleCSRFError } from './middleware/csrf';

// Importar rutas
import experienceRoutes from './routes/experiences';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import blogRoutes from './routes/blog';
import adminRoutes from './routes/admin';
import instagramRoutes from './routes/instagram';
import contactRoutes from './routes/contact';
import authRoutes from './routes/auth';

// Importar servicios
import { syncInstagramPosts } from './services/instagram';

// Configurar variables de entorno
dotenv.config();

// Inicializar Prisma
export const prisma = new PrismaClient();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging y monitoreo
app.use(requestLogger);
app.use(performanceMonitor.middleware());
app.use(generalLimiter);
app.use(conditionalCSRF);
app.use(handleCSRFError);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/contact', contactRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para métricas (protegido para admin)
app.get('/api/metrics', (req, res) => {
  res.json(performanceMonitor.getMetrics());
});

// Programar sincronización de Instagram cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  console.log('Sincronizando posts de Instagram...');
  try {
    await syncInstagramPosts();
    console.log('Sincronización de Instagram completada');
  } catch (error) {
    console.error('Error en sincronización de Instagram:', error);
  }
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Cerrando servidor...');
  await prisma.$disconnect();
  await cacheService.close();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  await prisma.$disconnect();
  await cacheService.close();
  process.exit(0);
}); 