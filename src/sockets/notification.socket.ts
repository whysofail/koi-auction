import { Server, Socket } from "socket.io";

// Function to emit a notification
const sendNotification = (io: Server, auctionId: string, message: string) => {
  io.to(auctionId).emit("newNotification", { message });
};

const notificationSocketHandler = (io: Server, socket: Socket): void => {
  // Handle sending notifications to clients
  socket.on("sendNotification", (data) => {
    const { auctionId, message } = data;

    // Emit notification to the specified auction room
    sendNotification(io, auctionId, message);
  });

  // Example: Handle sending system-wide notifications
  socket.on("sendSystemNotification", (message: string) => {
    // Emit the message to all connected clients
    io.emit("systemNotification", { message });
  });
};

export default notificationSocketHandler;
