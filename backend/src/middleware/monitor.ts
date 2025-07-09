import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../services/logger';

const logger = createLogger('Performance');

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorCount: number;
  lastMinuteRequests: number[];
  slowestEndpoints: Map<string, number>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorCount: 0,
    lastMinuteRequests: [],
    slowestEndpoints: new Map()
  };

  private readonly SLOW_THRESHOLD = 1000; // 1 segundo

  constructor() {
    // Limpiar las solicitudes del último minuto cada minuto
    setInterval(() => {
      const now = Date.now();
      this.metrics.lastMinuteRequests = this.metrics.lastMinuteRequests.filter(
        timestamp => now - timestamp < 60000
      );
    }, 60000);

    // Registrar métricas cada 5 minutos
    setInterval(() => {
      this.logMetrics();
    }, 300000);
  }

  private logMetrics() {
    const rps = this.metrics.lastMinuteRequests.length / 60;
    const errorRate = (this.metrics.errorCount / this.metrics.requestCount) * 100;

    // Convertir el Map a un array y ordenar por tiempo de respuesta
    const slowEndpoints = Array.from(this.metrics.slowestEndpoints.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    logger.info('Performance Metrics', {
      totalRequests: this.metrics.requestCount,
      averageResponseTime: Math.round(this.metrics.averageResponseTime),
      requestsPerSecond: rps.toFixed(2),
      errorRate: errorRate.toFixed(2),
      errorCount: this.metrics.errorCount,
      top5SlowestEndpoints: slowEndpoints
    });
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      this.metrics.requestCount++;
      this.metrics.lastMinuteRequests.push(start);

      // Interceptar la respuesta
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        const duration = Date.now() - start;
        const path = `${req.method} ${req.path}`;

        // Actualizar tiempo promedio de respuesta
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + duration) / 
          this.metrics.requestCount;

        // Registrar endpoints lentos
        if (duration > this.SLOW_THRESHOLD) {
          this.metrics.slowestEndpoints.set(path, duration);
          logger.warn(`Slow endpoint detected: ${path}`, {
            duration,
            method: req.method,
            path: req.path,
            query: req.query,
          });
        }

        // Registrar errores
        if (res.statusCode >= 400) {
          this.metrics.errorCount++;
          logger.error(`Request error: ${res.statusCode}`, {
            method: req.method,
            path: req.path,
            duration,
            statusCode: res.statusCode
          });
        }

        return originalEnd.apply(res, args);
      };

      next();
    };
  }

  public getMetrics() {
    return {
      ...this.metrics,
      lastMinuteRequests: this.metrics.lastMinuteRequests.length,
      slowestEndpoints: Object.fromEntries(this.metrics.slowestEndpoints)
    };
  }
}

export const performanceMonitor = new PerformanceMonitor(); 