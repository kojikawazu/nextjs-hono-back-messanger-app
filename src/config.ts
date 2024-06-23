import * as dotenv from 'dotenv';

/** .envファイルを読み込む */
dotenv.config();

export const config = {
    corsAddress: process.env.CORS_ADDRESS as string,
    port: process.env.PORT || 3000,
    wsPort: parseInt(process.env.WS_PORT || '3001', 10),
    redisUrl: process.env.REDIS_URL || 'redis://xxx:6379',
}
