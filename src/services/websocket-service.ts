import { Hono } from 'hono';
import { serve, ServerWebSocket } from 'bun';

const healthService = new Hono();
const health_port = 3002;
let clients = new Set<ServerWebSocket<undefined>>();

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export function setupWebSocketServer(port: number) {
    console.log(`setupWebSocketServer: port=${port}`);

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
            open(ws: ServerWebSocket<undefined>) {
                console.log(`[Back] WebSocket connection established`);
                clients.add(ws);
                console.log(`[Back] Current clients size: ${clients.size}`);

                setTimeout(() => {
                    //ws.send('connected!');
                    console.log('-sent connected-');
                }, 1);
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
            close(ws: ServerWebSocket<undefined>) {
                console.log(`[Back] WebSocket connection closed`);
                clients.delete(ws);
                console.log(`[Back] Current clients size: ${clients.size}`);
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
}

export function getClients() {
    return clients;
}
