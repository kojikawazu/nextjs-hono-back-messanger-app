import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { getClients, getClient, getClientIds } from '../services/websocket-service';

/** Honoインスタンス */
const messages = new Hono();
/** Prismaクライアントインスタンス */
const prisma = new PrismaClient();

/**
 * メッセージデータの取得
 */
messages.get('/', async (c) => {
    console.log('[Back] /messages GET start...');
    try {
        const allowMessages = await prisma.message.findMany({
            include: { user: true },
            orderBy: { createdAt: 'asc' },
        });

        console.log('[Back] /messages GET end.');
        return c.json(allowMessages);
    } catch (err) {
        console.error('[Back] Failed to get messages:', err);
        return c.json({ error: 'Failed to fetch messages' }, 500);
    }
});

/**
 * メッセージデータの追加
 */
messages.post('/', async (c) => {
    console.log('[Back] /messages POST start');
    const { content, userId } = await c.req.json();

    if (!content || !userId) {
        console.error('[Back] Invalid request[400]');
        return c.json({ error: 'Invalid request' }, 400);
    }
    console.log('Valid, OK');

    try {
        const newMessage = await prisma.message.create({
            data: {
                content,
                userId,
            },
        });
        console.log('[Back] Prisma created');

        const messageWithUser = await prisma.message.findUnique({
            where: { id: newMessage.id },
            include: { user: true },
        });
        console.log('[Back] Prisma messageWithUser');

        // [ブロードキャスト]
        const clientIds = await getClientIds();
        console.debug(`[Back] clients.size: ${clientIds.length}`);
        clientIds.forEach(async (clientId) => {
            console.log('[Back] Broadcast start');
            const client = await getClient(clientId);
            console.debug(`[Back] Broadcast: ${client}`);

            if (client) {
                console.debug(`[Back] Broadcast send. ${JSON.stringify({ action: 'sendMessage', message: messageWithUser })}`);
                client.send(JSON.stringify({ action: 'sendMessage', message: messageWithUser }));
            }
            console.log('[Back] Broadcast end');
        });
        //const clients = getClients();
        // console.debug(`[Back] clients.size: ${clients.size}`);
        // clients.forEach(client => {
        //     console.log('[Back] Broadcast start');
        //     console.debug(`[Back] Broadcast: ${client}`);
        //     if (client.readyState === WebSocket.OPEN) {
        //         console.debug(`[Back] Broadcast send. ${JSON.stringify({ action: 'sendMessage', message: messageWithUser })}`);
        //         client.send(JSON.stringify({ action: 'sendMessage', message: messageWithUser }));
        //     }
        //     console.log('[Back] Broadcast end');
        // });

        console.log('[Back] /messages POST end.');
        return c.json(messageWithUser, 201);
    } catch (err) {
        console.error('[Back] Failed to add message:', err);
        return c.json({ error: 'Failed to create message' }, 500);
    }
});

/**
 * メッセージデータの更新
 */
messages.put('/:messageId', async (c) => {
    console.log('[Back] /messages PUT start');
    const { messageId } = c.req.param();
    const { content }   = await c.req.json();

    if (!content) {
        console.error('[Back] Invalid request[400]');
        return c.json({ error: 'Invalid request' }, 400);
    }

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });
        console.log('[Back] Prisma get.');

        if (!message) {
            console.error('[Back] Message not found.[404]');
            return c.json({ error: 'Message not found.'}, 404);
        }
        console.log('[Back] Valid, OK');

        const updatedMessage= await prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                content: content,
            },
            include: { user: true },
        });
        console.log('[Back] Prisma updated');

        // [ブロードキャスト]
        const clientIds = await getClientIds();
        console.debug(`[Back] clients.size: ${clientIds.length}`);
        clientIds.forEach(async (clientId) => {
            console.log('[Back] Broadcast start');
            const client = await getClient(clientId);
            console.debug(`[Back] Broadcast: ${client}`);

            if (client) {
                console.debug(`[Back] Broadcast send. ${JSON.stringify({ action: 'updateMessage', message: updatedMessage  })}`);
                client.send(JSON.stringify({ action: 'updateMessage', message: updatedMessage  }));
            }

            console.log('[Back] Broadcast end');       
        });
        // const clients = getClients();
        // console.debug(`[Back] clients.size: ${clients.size}`);
        // clients.forEach(client => {
        //     console.log('[Back] Broadcast start');
        //     console.debug(`[Back] Broadcast: ${client}`);
        //     if (client.readyState === WebSocket.OPEN) {
        //         console.debug(`[Back] Broadcast send. ${JSON.stringify({ action: 'updateMessage', message: updatedMessage  })}`);
        //         client.send(JSON.stringify({ action: 'updateMessage', message: updatedMessage  }));
        //     }
        //     console.log('[Back] Broadcast end');
        // });

        console.log('[Back] /messages PUT end.');
        return c.json(updatedMessage, 200);
    } catch (err) {
        console.error('[Back] Failed to update message:', err);
        return c.json({ error: 'Failed to create message' }, 500);
    }
});

/**
 * メッセージデータの削除
 */
messages.delete('/:messageId', async (c) => {
    console.log('[Back] /messages DELETE start');
    const { messageId } = c.req.param();

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });
        console.log('[Back] Prisma get.');
        
        if (!message) {
            console.error('[Back] Message not found[404]');
            return c.json({ error: 'Message not found.'}, 404);
        }

        await prisma.message.delete({
            where: {id: messageId },
        });
        console.log('[Back] Prisma deleted');

        // [ブロードキャスト]
        const clientIds = await getClientIds();
        console.debug(`[Back] clients.size: ${clientIds.length}`);
        clientIds.forEach(async (clientId) => {
            console.log('[Back] Broadcast start');
            const client = await getClient(clientId);
            console.debug(`[Back] Broadcast: ${client}`);
            
            if (client) {
                console.debug(`[Back] Broadcast send. ${JSON.stringify({ action: 'deleteMessage', messageId })}`);
                client.send(JSON.stringify({ action: 'deleteMessage', messageId }));
            }

            console.log('[Back] Broadcast end');
        });
        // const clients = getClients();
        // console.debug(`[Back] clients.size: ${clients.size}`);
        // clients.forEach(client => {
        //     console.log('[Back] Broadcast start');
        //     console.debug(`[Back] Broadcast: ${client}`);
            
        //     if (client.readyState === WebSocket.OPEN) {
        //         console.debug(`[Back] Broadcast send. ${JSON.stringify({ action: 'deleteMessage', messageId })}`);
        //         client.send(JSON.stringify({ action: 'deleteMessage', messageId }));
        //     }
        //     console.log('Broadcast end');
        // });

        console.log('[Back] /messages DELETE end.');
        return c.text('', 204);
    } catch (err) {
        console.error('[Back] Failed to delete message:', err);
        return c.json({ error: 'Failed to delete message' }, 500);
    }
});

export default messages;
