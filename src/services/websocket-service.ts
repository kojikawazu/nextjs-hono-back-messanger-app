import { Hono } from 'hono';
import { serve } from 'bun';
import { WebSocketServer } from "ws";

const socketService = new Hono();
let wss: WebSocketServer;
const health_port = 3002;

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export function setupWebSocketServer(port: number) {
    console.log(`setupWebSocketServer: port=${port}`);
    wss = new WebSocketServer({ port });

    wss.on('connection', (ws) => {
        console.log(`WebSocket connection established`);

        ws.on('message', async (message) => {
            console.log(`Received message: ${message.toString()}`);

            const { content, userId } = JSON.parse(message.toString());

            if (!content || !userId) {
                console.log(`Invalid request: content=${content}, userId=${userId}`);
                ws.send(JSON.stringify({ error: 'Invalid request' }));
                return;
            }

            try {
                const messageWithUser = { content, user: { id: userId, name: 'Unknown' } };
                console.log(`Broadcasting message: ${JSON.stringify(messageWithUser)}`);
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === ws.OPEN) {
                        client.send(JSON.stringify({ messageWithUser }));
                    }
                });
            } catch (err) {
                console.error(`Error broadcasting message: ${err}`);
                ws.send(JSON.stringify({ error: 'Failed to create message' }));
            }
        });

        ws.on('close', () => {
            console.log(`WebSocket connection closed`);
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
        });
    });

    socketService.get('/ws-health', (c) => {
        console.log(`socketService: Hello Hono!`);
        return c.text('Hello Hono!');
    });

    serve({
        fetch: socketService.fetch,
        port: health_port,
        // key: readFileSync("./certs/key.pem"),
        // cert: readFileSync("./certs/cert.pem")
    });

    console.log(`WebSocketServer is running on port ${port}`);
    return wss;
}

export function getWebSocketServer() {
    return wss;
}
