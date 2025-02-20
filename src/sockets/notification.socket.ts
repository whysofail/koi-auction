import { Namespace, Server } from "socket.io";
import { AuthenticatedSocket } from ".";

const notificationSocket = (
  io: Server | Namespace,
  socket: AuthenticatedSocket,
): void => {
  socket.on("disconnect", () => {
    console.log("Client disconnected from /auth notification");
  });
};
export default notificationSocket;
