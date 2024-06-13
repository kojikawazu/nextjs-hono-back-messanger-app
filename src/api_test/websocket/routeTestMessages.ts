import { Hono } from 'hono';
import { getTestWebSocketServer } from './webSocketService';

/**
 * これはUTではありません
 * [テスト方法]
 * index.tsに以下設定
 * 
 * import testWebSocketMessages from './api_test/websocket/routeTestMessages';
 * import { setupTestWebSocketServer } from './api_test/websocket/webSocketService'; 
 * 
 * app.route('/test_messages', testWebSocketMessages);
 * setupTestWebSocketServer(検証ポート);
 * 
 */

/** Honoインスタンス化 */
const testWebSocketMessages = new Hono();

/**
 * WebSocketテスト用API
 */
testWebSocketMessages.post('/', async (c) => {
    const { message } = await c.req.json();
    console.log("debug");

    const wss = getTestWebSocketServer();
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({ message }));
        }
    });

    return c.json({ success: true });
});

export default testWebSocketMessages;
