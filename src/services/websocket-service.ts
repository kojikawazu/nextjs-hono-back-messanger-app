import { Hono } from 'hono';
import { serve } from 'bun';
import { WebSocketServer } from "ws";

const healthService = new Hono();
const health_port = 3002;
let wss: WebSocketServer;

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export function setupWebSocketServer(port: number) {
    console.log(`setupWebSocketServer: port=${port}`);
    wss = new WebSocketServer({ port });

    healthService.get('/ws-health', (c) => {
        console.log(`socketService: Hello Hono!`);
        return c.text('Hello Hono!');
    });

    serve({
        fetch: healthService.fetch,
        port: health_port,
        // key: readFileSync("./certs/key.pem"),
        // cert: readFileSync("./certs/cert.pem")
    });

    serve({
        port: port,
        websocket: {
            open(ws) {
                console.log(`[Back] WebSocket connection opened`);
            },

            async message(ws, message) {
                console.log(`[Back] Received message: ${message}`);
                const { content, userId } = JSON.parse(message.toString());

                if (!content || !userId) {
                    console.log(`[Back] Invalid request: content=${content}, userId=${userId}`);
                    ws.send(JSON.stringify({ error: 'Invalid request' }));
                    return;
                }

                const messageWithUser = { content, user: { id: userId, name: 'Unknown' } };
                console.log(`[Back] Broadcasting message: ${JSON.stringify(messageWithUser)}`); 
            },
            close(ws) {
                console.log(`[Back] WebSocket connection closed`);
            },
        },

        fetch(req, server) {
            if (server.upgrade(req)) {
                return;
            }

            return new Response('Not Found', { status: 405 });
        }
    });

    console.log(`WebSocketServer is running on port ${port}`);
    return wss;
}

export function getWebSocketServer() {
    return wss;
}
