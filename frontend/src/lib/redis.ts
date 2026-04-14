import Redis from 'ioredis';

const REDIS_URL = 'redis://default:b8fx8QqhP9xasBe8KK2LyVtg8Yxugkzx@redis-17255.c232.us-east-1-2.ec2.cloud.redislabs.com:17255';

if (!REDIS_URL) {
  console.warn('REDIS_URL is not set. Database operations will fail.');
}

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
});

export default redis;
