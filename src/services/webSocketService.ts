import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer;

/**
 * WebSocketServerのセットアップ
 * @param port WebSocket用ポート
 * @returns WebSocketServerインスタンス
 */
export function setupWebSocketServer(port: number) {
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
    return wss;
}

export function getWebSocketServer() {
    return wss;
}