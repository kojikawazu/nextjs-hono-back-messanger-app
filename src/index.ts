import { Hono } from 'hono';
import { serve } from 'bun';
import { cors } from 'hono/cors';
import { config } from './config';
import { setupWebSocketServer } from './services/webSocketService';
import messages from './routes/routeMessages';

// Honoのインスタンスを作成
const app = new Hono().basePath('/api');

// CORSを許可するミドルウェア
const CORS_ADDRESS = config.corsAddress;
app.use('*', cors({
  origin: CORS_ADDRESS,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// WebSocketサーバーの設定
setupWebSocketServer(config.wsPort);

// テスト用エンドポイント
app.get('/hello', (c) => {
  console.log(`index: Hello Hono!`);
  return c.text('Hello Hono!');
});

app.route('/messages', messages);

console.log('Setting up HTTPS server...');

// HTTPSサーバーの設定
serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`HTTPS server running on port:${config.port}`);
//console.log(`WebSocket server running on port:${config.wsPort}`);

export default app;