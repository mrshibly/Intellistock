import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.orgId) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', user.orgId);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
