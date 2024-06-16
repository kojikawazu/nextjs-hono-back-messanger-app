import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { getWebSocketServer } from '../services/websocket-service';

/** Honoインスタンス */
const messages = new Hono();
/** Prismaクライアントインスタンス */
const prisma = new PrismaClient();

messages.get('/', async (c) => {
  try {
      const allowMessages = await prisma.message.findMany({
          include: { user: true },
          orderBy: { createdAt: 'asc' },
      });
      return c.json(allowMessages);
  } catch (err) {
      return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

messages.post('/', async (c) => {
  const { content, userId } = await c.req.json();

  if (!content || !userId) {
      return c.json({ error: 'Invalid request' }, 400);
  }

  try {
      const newMessage = await prisma.message.create({
          data: {
              content,
              userId,
          },
      });

      const messageWithUser = await prisma.message.findUnique({
          where: { id: newMessage.id },
          include: { user: true },
      });

      // [ブロードキャスト]
      const wss = getWebSocketServer();
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ messageWithUser }));
        }
      });

      return c.json(messageWithUser, 201);
  } catch (err) {
      return c.json({ error: 'Failed to create message' }, 500);
  }
});

export default messages;
