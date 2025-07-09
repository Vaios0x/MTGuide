import Redis from 'redis';
import { createLogger } from './logger';

const logger = createLogger('CacheService');

class CacheService {
  private client: Redis.RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
    }
  }

  async set(key: string, value: any, expirationInSeconds?: number): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }

      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (expirationInSeconds) {
        await this.client.setEx(key, expirationInSeconds, stringValue);
        logger.debug(`Cache set with expiration: ${key}`);
      } else {
        await this.client.set(key, stringValue);
        logger.debug(`Cache set: ${key}`);
      }
    } catch (error) {
      logger.error('Error setting cache:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }

      const value = await this.client.get(key);
      
      if (!value) {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }

      logger.debug(`Cache hit: ${key}`);
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      logger.error('Error getting cache:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }

      await this.client.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Error deleting cache:', error);
      throw error;
    }
  }

  async flush(): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }

      await this.client.flushAll();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Error flushing cache:', error);
      throw error;
    }
  }

  // Método para cerrar la conexión
  async close(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
      throw error;
    }
  }
}

export const cacheService = new CacheService(); 