import { Hono } from 'hono';
import * as Pusher from 'pusher';
import * as dotenv from 'dotenv'; 

/**
 * これはUTではありません
 * [テスト方法]
 * index.tsに以下設定
 * 
 * import routeMessages from './api_test/pusher/routeTestMessages';
 * 
 * app.route('/test_messages', routeMessages);
 * 
 * setupWebSocketServer(config.wsPort);
 */

// .envファイルを読み込む
dotenv.config();

// Honoのインスタンスを作成
const routeMessages = new Hono();

// Pusherの設定
const pusher = new Pusher.default({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.PUSHER_CLUSTER as string,
  useTLS: true,
});

// メッセージを受け取ってPusherに送信するエンドポイント
routeMessages.post('/', async (c) => {
  const { message } = await c.req.json();
  await pusher.trigger('chat', 'message', { message });
  return c.json({ success: true });
});

export default routeMessages;

