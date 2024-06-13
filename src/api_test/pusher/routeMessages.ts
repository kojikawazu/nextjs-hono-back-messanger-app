import { Hono } from 'hono';
import * as Pusher from 'pusher';
import * as dotenv from 'dotenv'; 
import { PrismaClient } from '@prisma/client';

/** .envファイルを読み込む */
dotenv.config();
/** Honoインスタンス */
const messages = new Hono();
/** Prismaクライアントインスタンス */
const prisma = new PrismaClient();

// Pusherの設定
const pusher = new Pusher.default({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.PUSHER_CLUSTER as string,
  useTLS: true,
});

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

      await pusher.trigger('chat', 'message', { messageWithUser });
      return c.json(messageWithUser, 201);
  } catch (err) {
      return c.json({ error: 'Failed to create message' }, 500);
  }
});


export default messages;

