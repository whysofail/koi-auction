import { Namespace, Server } from "socket.io";
import Notification from "../entities/Notification";
import socketService from "../services/socket.service";
import { AuthenticatedSocket } from ".";

const notificationSocket = (
  io: Server | Namespace,
  socket: AuthenticatedSocket,
): void => {
  console.log(
    "New client listening on /auth notification",
    socket.user?.user_id,
  );

  // Attach the send function to notificationSocket object
  notificationSocket.send = (
    userId: string,
    event: string,
    notification: Notification,
  ): void => {
    // Use socketService to emit the notification to the specific user
    socketService.emitToAuthRoom(userId, event, notification);
  };

  // Handle sending notifications to clients
  socket.on("sendNotification", (data: Notification) => {
    const {
      user,
      message,
      notification_id,
      reference_id,
      type,
      status,
      role,
      created_at,
      updated_at,
    } = data;

    const userId = user.user_id;

    // Call the send method
    notificationSocket.send(userId, "notification", {
      notification_id,
      user,
      message,
      reference_id,
      type,
      status,
      role,
      created_at,
      updated_at,
    });
  });
};

// Add the send function to the notificationSocket
notificationSocket.send = (
  userId: string,
  event: string,
  notification: Notification,
): void => {
  // This method can be used directly to send a notification without the socket event
  console.log(
    `Sending notification to user ${userId} via notificationSocket.send()`,
  );
  socketService.emitToRoom(userId, event, {
    entity: "notification",
    data: notification,
  });
};

export default notificationSocket;
