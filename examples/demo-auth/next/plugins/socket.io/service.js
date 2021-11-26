import { io } from 'socket.io-client';
import { useEffect } from 'react';
import hooks from 'leemons-hooks';

let socket = null;

export const SocketIoService = {
  connect: (endpoint, config) => (socket = io(endpoint, config)),
  emit: (event, data, callback) => socket.emit(event, data, callback),
  on: (event, callback) => socket.on(event, callback),
  useOn: (_event, callback) => {
    const onEvent = ({ args: [{ event, data }] }) => {
      if (_event === event) return callback(event, data);
    };
    useEffect(() => {
      hooks.addAction('socket.io:onAny', onEvent);
      return () => {
        hooks.removeAction('socket.io:onAny', onEvent);
      };
    });
  },
  onAny: (callback) => socket.onAny(callback),
  useOnAny: (callback) => {
    const onEvent = ({ args: [{ event, data }] }) => {
      return callback(event, data);
    };
    useEffect(() => {
      hooks.addAction('socket.io:onAny', onEvent);
      return () => {
        hooks.removeAction('socket.io:onAny', onEvent);
      };
    });
  },
  disconnect: () => {
    if (socket) socket.disconnect();
  },
};
