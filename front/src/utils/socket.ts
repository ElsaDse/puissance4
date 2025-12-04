import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:4000", {
  withCredentials: true,
  autoConnect: false, // on se connecte manuellement quand on en a besoin
});

export default socket;