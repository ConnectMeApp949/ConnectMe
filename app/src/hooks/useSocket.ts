import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-production-dda7.up.railway.app';

// TODO: get token from SecureStore/auth context
let authToken = '';
export function setSocketAuthToken(token: string) { authToken = token; }

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(API_URL, {
      auth: { token: authToken },
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useSocket() {
  const socket = useRef(getSocket());

  useEffect(() => {
    if (!socket.current.connected) {
      socket.current.auth = { token: authToken };
      socket.current.connect();
    }
    return () => {
      // Don't disconnect — keep alive for background notifications
    };
  }, []);

  const joinRoom = useCallback((bookingId: string) => {
    socket.current.emit('join_room', bookingId);
  }, []);

  const leaveRoom = useCallback((bookingId: string) => {
    socket.current.emit('leave_room', bookingId);
  }, []);

  const sendMessage = useCallback((data: {
    bookingId: string;
    receiverId: string;
    content: string;
  }) => {
    socket.current.emit('send_message', data);
  }, []);

  const markRead = useCallback((bookingId: string) => {
    socket.current.emit('mark_read', bookingId);
  }, []);

  const onNewMessage = useCallback((callback: (msg: any) => void) => {
    socket.current.on('new_message', callback);
    return () => { socket.current.off('new_message', callback); };
  }, []);

  const onMessagesRead = useCallback((callback: (data: any) => void) => {
    socket.current.on('messages_read', callback);
    return () => { socket.current.off('messages_read', callback); };
  }, []);

  return { joinRoom, leaveRoom, sendMessage, markRead, onNewMessage, onMessagesRead };
}
