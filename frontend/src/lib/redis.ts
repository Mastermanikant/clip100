import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.warn('[Frank Drop] REDIS_URL is not set. Database operations will fail.');
}

const redis = new Redis(REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('[Frank Drop] Redis connection error:', err.message);
});

export default redis;
