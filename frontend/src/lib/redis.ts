import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || '';

if (!REDIS_URL) {
  console.warn('REDIS_URL is not set. Database operations will fail.');
}

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
});

export default redis;
