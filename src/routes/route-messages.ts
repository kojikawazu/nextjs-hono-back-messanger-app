import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { getClients } from '../services/websocket-service';

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
    console.log('POST start');
    const { content, userId } = await c.req.json();

  if (!content || !userId) {
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
      console.log('Prisma created');

      const messageWithUser = await prisma.message.findUnique({
          where: { id: newMessage.id },
          include: { user: true },
      });
      console.log('Prisma messageWithUser');

      // [ブロードキャスト]
      const clients = getClients();
      console.debug(`clients.size: ${clients.size}`);
      clients.forEach(client => {
        console.log('Broadcast start');
        console.debug(`Broadcast: ${client}`);
        if (client.readyState === WebSocket.OPEN) {
            console.debug(`Broadcast send. ${messageWithUser}`);
            client.send(JSON.stringify({ messageWithUser }));
        }
        console.log('Broadcast end');
      });

      console.log('POST end.');
      return c.json(messageWithUser, 201);
  } catch (err) {
      return c.json({ error: 'Failed to create message' }, 500);
  }
});

export default messages;
