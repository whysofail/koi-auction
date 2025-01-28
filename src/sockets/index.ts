import { Server, Socket } from "socket.io";
import auctionSocket from "./auction.socket";
import bidSocket from "./bid.socket";
import notificationSocket from "./notification.socket";
import { socketAuthMiddleware } from "./socketauth.middleware";
import adminSocketHandler from "./admin.socket";

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
  authNamespace.use(socketAuthMiddleware);

  authNamespace.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.user_id;
    if (userId) {
      socket.join(`user:${userId}`);
    }
    // Initialize authenticated socket functionalities, such as bidSocket
    bidSocket(authNamespace, socket);
    notificationSocket(authNamespace, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected from authenticated namespace");
    });
  });

  const adminNamespace = io.of("/admin");
  adminNamespace.use(socketAuthMiddleware);
  adminNamespace.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.user_id;
    if (userId) {
      socket.join(`user:${userId}`);
    }
    // Initialize admin socket functionalities
    console.log("Client connected to admin namespace");
    adminSocketHandler(adminNamespace);
    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected from admin namespace");
    });
  });
}
