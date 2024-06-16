import { WebSocketServer } from 'ws';

let wss: WebSocketServer;

/**
 * テスト用WebSocketサーバのセットアップ
 * @param port 検証ポート
 * @returns WebSocketServerインスタンス
 */
export function setupTestWebSocketServer(port: number) {
    wss = new WebSocketServer({ port });
    
    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const { message: msg } = JSON.parse(message.toString());

            // ブロードキャスト
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({ message: msg }));
                }
            });
        });
    });

    return wss;
}

export function getTestWebSocketServer() {
    return wss;
}
