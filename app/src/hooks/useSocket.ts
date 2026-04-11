import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

let socketInstance: Socket | null = null;

function getSocket(token: string | null): Socket {
  if (!socketInstance) {
    socketInstance = io(API_URL, {
      auth: { token: token ?? '' },
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useSocket() {
  const { token } = useAuth();
  const socket = useRef(getSocket(token));

  useEffect(() => {
    // Update auth token whenever it changes
    socket.current.auth = { token: token ?? '' };

    if (token && !socket.current.connected) {
      socket.current.connect();
    }

    if (!token && socket.current.connected) {
      socket.current.disconnect();
    }

    return () => {
      // Don't disconnect — keep alive for background notifications
    };
  }, [token]);

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
