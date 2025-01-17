import SocketIOService from "./socketio.service";
import { AuthenticatedSocket } from "../sockets";

const emitToRoom = async (
  room: string,
  event: string,
  data: any,
): Promise<void> => {
  const io = SocketIOService.getInstance().getIO();

  // Check if the room has any connected sockets
  const sockets = await io.in(`user:${room}`).fetchSockets();
  console.log({ sockets });
  const isRoomAvailable = sockets.length > 0;

  // Log the room availability status
  console.log(
    `Checking availability of room "${room}". Available: ${isRoomAvailable ? "Yes" : "No"}`,
  );

  // Log before emitting to room
  console.log(
    `Emitting event "${event}" to room "${`user:${room}`}" with data:`,
    data,
  );

  io.to(`user:${room}`).emit(event, data);

  // Log after emitting to room
  console.log(`Event "${event}" emitted to room "${room}"`);
};

const emitToUser = async (
  socketId: string,
  event: string,
  data: any,
): Promise<void> => {
  const io = SocketIOService.getInstance().getIO();

  // Check if the user is in a specific room, assuming the room is named by userId
  const getRoom = async (userId: string): Promise<boolean> => {
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    return sockets.length > 0;
  };

  // Retrieve userId from socketId or other method, assuming socketId corresponds to a userId
  const socket = io.sockets.sockets.get(socketId) as
    | AuthenticatedSocket
    | undefined;
  if (!socket) {
    console.warn(`No socket found for socketId: ${socketId}`);
    return;
  }

  const userId = socket.user?.user_id; // Retrieve userId from socket (assuming user is attached to the socket)

  if (!userId) {
    console.warn("No user attached to the socket.");
    return;
  }

  // Check if the user is connected to a specific room
  const isUserConnected = await getRoom(userId);

  if (!isUserConnected) {
    console.warn(`User with userId: ${userId} is not connected to the room.`);
    return;
  }

  // Log before emitting to user
  console.log(`Emitting event "${event}" to user with socketId: ${socketId}`);

  // Emit the event to the specific socket
  socket.emit(event, data);

  // Log after emitting to user
  console.log(`Event "${event}" sent to user with socketId: ${socketId}`);
};

const emitToAuthenticatedNamespace = (event: string, data: any): void => {
  const io = SocketIOService.getInstance().getIO();
  const authNamespace = io.of("/auth");

  // Log emitting to authenticated namespace
  console.log(`Emitting event "${event}" to authenticated namespace`);

  authNamespace.emit(event, data);

  // Log after emitting to the namespace
  console.log(`Event "${event}" emitted to authenticated namespace`);
};

const emitToAuthRoom = async (
  room: string,
  event: string,
  data: any,
): Promise<void> => {
  const io = SocketIOService.getInstance().getIO();
  const authNamespace = io.of("/auth");

  // Check if the room has any connected sockets
  const sockets = await authNamespace.in(`user:${room}`).fetchSockets();
  const isRoomAvailable = sockets.length > 0;

  // Log the room availability status
  console.log(
    `Checking availability of room "${room}". Available: ${isRoomAvailable ? "Yes" : "No"}`,
  );

  // Log before emitting to room
  console.log(
    `Emitting event "${event}" to room "${`user:${room}`}" with data:`,
    data,
  );

  authNamespace.to(`user:${room}`).emit(event, data);

  // Log after emitting to room
  console.log(`Event "${event}" emitted to room "user:${room}"`);
};

const emitToAll = (event: string, data: any): void => {
  const io = SocketIOService.getInstance().getIO();

  // Log before emitting to all
  console.log(`Emitting event "${event}" to all connected users`);

  io.emit(event, data);

  // Log after emitting to all
  console.log(`Event "${event}" sent to all connected users`);
};

export default {
  emitToRoom,
  emitToUser,
  emitToAuthenticatedNamespace,
  emitToAuthRoom,
  emitToAll,
};
