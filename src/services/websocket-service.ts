import { Hono } from 'hono';
import { serve, ServerWebSocket } from 'bun';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

/**
 * ServerWebSocket拡張IF
 * @extends ServerWebSocket<undefined>
 */
interface ClientWebSocket extends ServerWebSocket<undefined> {
    clientId?: string;
}

const healthService = new Hono();
const health_port = 3002;
const clients = new Map<string, ClientWebSocket>();

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export async function setupWebSocketServer(port: number) {
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
            open(ws: ClientWebSocket) {
                console.log(`[Back] WebSocket connection established`);
                const clientId = uuidv4();
                ws.clientId = clientId;
                clients.set(clientId, ws);
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

                clients.forEach(client => {
                    if (client && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ action: 'sendMessage', message: messageWithUser }));
                    }
                });
            },
            close(ws: ClientWebSocket) {
                console.log(`[Back] WebSocket connection closed`);
                if (ws.clientId) {
                    clients.delete(ws.clientId);  // クライアントを削除
                }
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

export async function getClient(clientId: string): Promise<ClientWebSocket | null> {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        return client;
    }
    return null;
}
