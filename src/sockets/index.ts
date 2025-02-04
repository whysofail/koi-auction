import { Server, Socket } from "socket.io";
import auctionSocket from "./auction.socket";
import bidSocket from "./bid.socket";
import notificationSocket from "./notification.socket";
import { socketAuthMiddleware } from "./socketauth.middleware";

export interface AuthenticatedSocket extends Socket {
  user?: {
    user_id: string;
    role: string;
  };
}

export default function initializeSockets(io: Server): void {
  // Public (Unauthenticated) namespace
  io.on("connection", (socket: Socket) => {
    console.log("Client connected to public namespace");

    // Initialize public socket functionalities that do not require authentication
    auctionSocket(io, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected from public namespace");
    });
  });

  // Authenticated namespace
  const authNamespace = io.of("/auth");

  // Apply the authentication middleware for this namespace
  authNamespace.use(socketAuthMiddleware(["user", "admin"]));

  authNamespace.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.user_id;
    if (userId) {
      socket.join(userId);
    }
    // Initialize authenticated socket functionalities, such as bidSocket
    bidSocket(authNamespace, socket);
    notificationSocket(authNamespace, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected from authenticated namespace");
    });
  });
}
