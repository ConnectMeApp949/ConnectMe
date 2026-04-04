import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './tokens';
import prisma from './prisma';
import { sendPushNotification } from './notifications';

let io: Server;

// Track which users are in which rooms
const activeRooms = new Map<string, Set<string>>(); // room -> set of userIds

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Authenticate on connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`[Socket] User connected: ${user.userId}`);

    // ─── Join booking room ───────────────────────────
    socket.on('join_room', (bookingId: string) => {
      const room = `booking_${bookingId}`;
      socket.join(room);

      if (!activeRooms.has(room)) activeRooms.set(room, new Set());
      activeRooms.get(room)!.add(user.userId);

      console.log(`[Socket] ${user.userId} joined ${room}`);
    });

    // ─── Leave booking room ──────────────────────────
    socket.on('leave_room', (bookingId: string) => {
      const room = `booking_${bookingId}`;
      socket.leave(room);
      activeRooms.get(room)?.delete(user.userId);
    });

    // ─── Send message ────────────────────────────────
    socket.on('send_message', async (data: {
      bookingId: string;
      receiverId: string;
      content: string;
    }) => {
      try {
        const { bookingId, receiverId, content } = data;
        if (!content.trim()) return;

        // Save to database
        const message = await prisma.message.create({
          data: {
            bookingId,
            senderId: user.userId,
            receiverId,
            content: content.trim(),
          },
          include: {
            sender: {
              select: { id: true, firstName: true, profilePhoto: true },
            },
          },
        });

        const outgoing = {
          id: message.id,
          senderId: message.senderId,
          senderName: message.sender.firstName,
          senderAvatar: message.sender.profilePhoto,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          isRead: false,
        };

        // Emit to room
        const room = `booking_${bookingId}`;
        io.to(room).emit('new_message', outgoing);

        // Push notification if recipient is not in the room
        const roomUsers = activeRooms.get(room);
        if (!roomUsers?.has(receiverId)) {
          await sendPushNotification(
            receiverId,
            `New message from ${message.sender.firstName}`,
            content.length > 80 ? content.slice(0, 80) + '...' : content,
            { bookingId, type: 'message' }
          );
        }
      } catch (err) {
        console.error('[Socket] send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Mark messages as read ───────────────────────
    socket.on('mark_read', async (bookingId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            bookingId,
            receiverId: user.userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        const room = `booking_${bookingId}`;
        io.to(room).emit('messages_read', {
          bookingId,
          readBy: user.userId,
        });
      } catch (err) {
        console.error('[Socket] mark_read error:', err);
      }
    });

    // ─── Disconnect ──────────────────────────────────
    socket.on('disconnect', () => {
      // Remove user from all active rooms
      for (const [room, users] of activeRooms) {
        users.delete(user.userId);
        if (users.size === 0) activeRooms.delete(room);
      }
      console.log(`[Socket] User disconnected: ${user.userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  return io;
}
