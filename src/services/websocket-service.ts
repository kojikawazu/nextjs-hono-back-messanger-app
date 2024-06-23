import { Hono } from 'hono';
import { serve, ServerWebSocket } from 'bun';
import { createClient, RedisClientType  } from 'redis';
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
let redisClient: RedisClientType;
const clients = new Map<string, ClientWebSocket>();

/**
 * Redis接続用
 * ElasticCache(Redis)に接続し、WebSocketのインスタンスを管理する状態にする。
 */
async function connectRedis() {
    console.log('connectRedis start...');
    
    redisClient = createClient({
      url: config.redisUrl,
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();

    console.log('connectRedis end.');
}

/**
 * クライアント管理
 * WebSocket(ws)のインスタンスを格納するclientsをredisClientに追加/削除を行う。
 * @param ws WebSocketインスタンス
 * @param action 'add' or 'remove'
 */
async function manageClient(ws: ClientWebSocket, action: 'add' | 'remove') {
    if (action === 'add') {
        const clientId = uuidv4();
        ws.clientId = clientId;
        clients.set(clientId, ws);
        await redisClient.hSet('clients', clientId, JSON.stringify({ clientId }));
    } else if (action === 'remove' && ws.clientId) {
        clients.delete(ws.clientId);
        await redisClient.hDel('clients', ws.clientId);
    }
    console.log(`[Back] Current clients size: ${await redisClient.hLen('clients')}`);
}

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export async function setupWebSocketServer(port: number) {
    console.log(`setupWebSocketServer: port=${port}`);
    await connectRedis();

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
                manageClient(ws, 'add');
                // const clientId = uuidv4();
                // ws.clientId = clientId;
                // addClient(ws, clientId);
                // console.log(`[Back] Current clients size: ${clients.size}`);

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

                const clientIds = await getClientIds();
                clientIds.forEach(async (clientId) => {
                    const client = await getClient(clientId);
                    if (client) {
                        client.send(JSON.stringify({ action: 'sendMessage', message: messageWithUser }));
                    }
                });
            },
            close(ws: ClientWebSocket) {
                console.log(`[Back] WebSocket connection closed`);
                manageClient(ws, 'remove');
                //clients.delete(ws);
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

export async function getClientIds() {
    return await redisClient.hKeys('clients');
}

export async function getClient(clientId: string): Promise<ClientWebSocket | null> {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        return client;
    }
    return null;
}
