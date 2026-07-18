import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;
// Reference count so multiple mounted consumers (e.g. the notification bell and
// the Orders live tracker) share one connection; the socket is only torn down
// when the last of them unmounts. Without this, unmounting one consumer would
// disconnect a socket the others still rely on.
let refCount = 0;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  // Authenticate the handshake so the server can place us in our own private
  // room. The server derives the room from this token, not from the emitted id.
  s.auth = { token: localStorage.getItem("token") };
  if (!s.connected) {
    s.connect();
    s.emit("join_room", userId);
  }
  refCount += 1;
  return s;
};

export const disconnectSocket = () => {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket?.connected) {
    socket.disconnect();
  }
};

export default getSocket;
