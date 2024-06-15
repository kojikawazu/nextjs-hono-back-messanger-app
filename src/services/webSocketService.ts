import { Hono } from 'hono';
import { serve } from 'bun';
import { WebSocketServer } from "ws";
import { readFileSync } from 'fs';
import { createServer } from "https";

const socketService = new Hono();
let wss: WebSocketServer;
const health_port = 3002;

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export function setupWebSocketServer(port: number) {
    // const server = createServer({
    //     key: readFileSync("./certs/key.pem"),
    //     cert: readFileSync("./certs/cert.pem")
    // });

    wss = new WebSocketServer({ port });

    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const { content, userId } = JSON.parse(message.toString());

            if (!content || !userId) {
                ws.send(JSON.stringify({ error: 'Invalid request' }));
                return;
            }

            try {
                const messageWithUser = { content, user: { id: userId, name: 'Unknown' } };
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === ws.OPEN) {
                        client.send(JSON.stringify({ messageWithUser }));
                    }
                });
            } catch (err) {
                ws.send(JSON.stringify({ error: 'Failed to create message' }));
            }
        });
    });

    socketService.get('/ws-health', (c) => {
        console.log(`socketService: Hello Hono!`);
        return c.text('Hello Hono!');
    });

    // server.listen(port, () => {
    //     console.log(`WebSocket server running on port:${port}`);
    // });

    serve({
        fetch: socketService.fetch,
        port: health_port,
        // key: readFileSync("./certs/key.pem"),
        // cert: readFileSync("./certs/cert.pem")
    });

    return wss;
}

export function getWebSocketServer() {
    return wss;
}