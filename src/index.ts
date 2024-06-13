import { Hono } from 'hono';
import { serve } from 'bun';
import { cors } from 'hono/cors';
import { config } from './config';
import { setupWebSocketServer } from './services/webSocketService';
import messages from './routes/routeMessages';

// Honoのインスタンスを作成
const app = new Hono().basePath('/api');;

// CORSを許可するミドルウェア
const CORS_ADDRESS = config.corsAddress;
app.use('*', cors({
  origin: CORS_ADDRESS,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// app.get('/', (c) => {
//   return c.text('Hello Hono!');
// });

app.route('/messages', messages);

// WebSocketサーバーの設定
setupWebSocketServer(config.wsPort);

serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`HTTP server running on port:${config.port}`);
console.log(`WebSocket server running on port:${config.wsPort}`);

export default app;
