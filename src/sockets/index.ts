import { Server, Socket } from "socket.io";
import auctionSocket from "./auction.socket";
import notificationSocket from "./notification.socket";
import { socketAuthMiddleware } from "./socketauth.middleware";
import {
  NamespaceType,
  RoomType,
  SocketConnectionStatus,
} from "../types/socket.types";

const log = {
  info: (message: string, data?: any) => console.log(message, data || ""),
  warn: (message: string, data?: any) => console.warn(message, data || ""),
  error: (message: string, data?: any) => console.error(message, data || ""),
};

export interface AuthenticatedSocket extends Socket {
  user?: {
    user_id: string;
    role: string;
  };
  connectionStatus?: SocketConnectionStatus;
}

const handleSocketConnection = (socket: Socket, namespace: NamespaceType) => {
  socket.on("error", (error) => {
    log.error(`Socket error in ${namespace} namespace`, {
      socketId: socket.id,
      error,
    });
  });
};

const initializeAuthenticatedSocket = async (
  io: Server,
  socket: AuthenticatedSocket,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace: NamespaceType,
): Promise<void> => {
  try {
    const userId = socket.user?.user_id;
    if (!userId) {
      log.warn("No user ID found for authenticated socket");
      socket.disconnect();
      return;
    }

    const userRoom = `user:${userId}` as RoomType;
    await socket.join(userRoom);

    // eslint-disable-next-line no-param-reassign
    socket.connectionStatus = {
      connected: true,
      socketId: socket.id,
      rooms: [userRoom],
      lastConnected: new Date(),
    };

    // Initialize socket handlers
    notificationSocket(io, socket);
  } catch (error) {
    log.error("Error initializing authenticated socket", {
      error,
      socketId: socket.id,
    });
    socket.disconnect();
  }
};

export default function initializeSockets(io: Server): void {
  try {
    // Public namespace
    const publicNamespace = io.of("" as NamespaceType);
    publicNamespace.on("connection", (socket: Socket) => {
      handleSocketConnection(socket, "default");
      auctionSocket(io, socket);
    });

    // Authenticated namespace
    const authNamespace = io.of("/auth" as NamespaceType);
    authNamespace.use(socketAuthMiddleware(["user", "admin"]));

    authNamespace.on("connection", (socket: AuthenticatedSocket) => {
      initializeAuthenticatedSocket(io, socket, "auth");
    });

    // Admin namespace
    const adminNamespace = io.of("/admin" as NamespaceType);
    adminNamespace.use(socketAuthMiddleware(["admin"]));

    adminNamespace.on("connection", (socket: AuthenticatedSocket) => {
      initializeAuthenticatedSocket(io, socket, "admin");
    });

    // Global error handling
    io.on("error", (error) => {
      log.error("Socket.IO server error:", error);
    });

    log.info("Socket.IO server initialized successfully");
  } catch (error) {
    log.error("Failed to initialize Socket.IO server:", error);
    throw error;
  }
}
