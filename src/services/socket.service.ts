import { Namespace, Server } from "socket.io";
import SocketIOService from "./socketio.service";
import { AuthenticatedSocket } from "../sockets";
import {
  EntityName,
  SocketEventType,
  SocketPayload,
  RoomType,
  NamespaceType,
} from "../types/socket.types";
import Notification from "../entities/Notification";

// Logger utility
const log = {
  info: (message: string, data?: any) => console.log(message, data || ""),
  warn: (message: string, data?: any) => console.warn(message, data || ""),
  error: (message: string, data?: any) => console.error(message, data || ""),
};

// Helper functions
const getRoomSockets = async (
  namespace: Namespace | Server,
  room: RoomType,
) => {
  try {
    return await namespace.in(room).fetchSockets();
  } catch (error) {
    log.error(`Failed to fetch sockets for room ${room}:`, error);
    return [];
  }
};

const isRoomActive = async (
  namespace: Namespace | Server,
  room: RoomType,
): Promise<boolean> => {
  const sockets = await getRoomSockets(namespace, room);
  return sockets.length > 0;
};

const emitWithLogging = <T extends EntityName>(
  emitter: any,
  event: SocketEventType,
  data: SocketPayload<T>,
  target: string,
): void => {
  log.info(`Emitting "${event}" to ${target} with data:`, data);
  emitter.emit(event, data);
  log.info(`Emitted "${event}" to ${target}`);
};

// Main service functions
const emitToRoom = async <T extends EntityName>(
  room: RoomType,
  event: SocketEventType,
  data: SocketPayload<T>,
): Promise<void> => {
  const io = SocketIOService.getInstance().getIO();

  if (!(await isRoomActive(io, room))) {
    log.warn(`Room "${room}" is not active or empty`);
    return;
  }

  emitWithLogging<T>(io.to(room), event, data, `room ${room}`);
};

const emitToUser = async <T extends EntityName>(
  socketId: string,
  event: SocketEventType,
  data: SocketPayload<T>,
): Promise<void> => {
  const io = SocketIOService.getInstance().getIO();
  const socket = io.sockets.sockets.get(socketId) as
    | AuthenticatedSocket
    | undefined;

  if (!socket) {
    log.warn(`No socket found for socketId: ${socketId}`);
    return;
  }

  const userId = socket.user?.user_id;
  if (!userId) {
    log.warn(`No user attached to socket: ${socketId}`);
    return;
  }

  const userRoom = `user:${userId}` as RoomType;
  if (!(await isRoomActive(io, userRoom))) {
    log.warn(`User ${userId} is not connected to any room`);
    return;
  }

  emitWithLogging<T>(socket, event, data, `user ${socketId}`);
};

const emitToAuthenticatedUser = <T extends EntityName>(
  userId: string,
  event: SocketEventType,
  data: SocketPayload<T>,
): void => {
  const authNamespace = SocketIOService.getInstance()
    .getIO()
    .of("/auth" as NamespaceType);
  emitWithLogging<T>(
    authNamespace.to(`user:${userId}`),
    event,
    data,
    `authenticated user ${userId}`,
  );
};

const emitToAuthRoom = async <T extends EntityName>(
  room: string,
  event: SocketEventType,
  data: SocketPayload<T>,
): Promise<void> => {
  const authNamespace = SocketIOService.getInstance()
    .getIO()
    .of("/auth" as NamespaceType);
  const userRoom = `user:${room}` as RoomType;

  if (!(await isRoomActive(authNamespace, userRoom))) {
    log.warn(`Auth room "${userRoom}" is not active or empty`);
    return;
  }

  emitWithLogging<T>(
    authNamespace.to(userRoom),
    event,
    data,
    `auth room ${userRoom}`,
  );
};

const emitToAdminRoom = async (data: Notification): Promise<void> => {
  const adminNamespace = SocketIOService.getInstance()
    .getIO()
    .of("/admin" as NamespaceType);
  emitWithLogging(
    adminNamespace,
    "admin",
    { entity: "notification", data },
    "admin namespace",
  );
};

const emitToAll = <T extends EntityName>(
  event: SocketEventType,
  data: SocketPayload<T>,
): void => {
  const io = SocketIOService.getInstance().getIO();
  emitWithLogging<T>(io, event, data, "all connected users");
};

const emitToNamespace = <T extends EntityName>(
  namespace: NamespaceType,
  event: SocketEventType,
  data: SocketPayload<T>,
): void => {
  const io = SocketIOService.getInstance().getIO();
  emitWithLogging<T>(io.of(namespace), event, data, namespace);
};

export default {
  emitToRoom,
  emitToUser,
  emitToAuthenticatedUser,
  emitToAuthRoom,
  emitToAll,
  emitToAdminRoom,
  emitToNamespace,
};
