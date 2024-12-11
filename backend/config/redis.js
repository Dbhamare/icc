const Redis = require('ioredis');

const redis = new Redis({
  host: 'redis',  // This should match the name of the Redis service in your docker-compose.yml
  port: 6379      // Default Redis port
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis error:', error);
});
