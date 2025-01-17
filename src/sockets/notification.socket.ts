import { Namespace, Server, Socket } from "socket.io";
import Notification from "../entities/Notification";
import socketService from "../services/socket.service";

const notificationSocket = (io: Server | Namespace, socket: Socket): void => {
  console.log("New client connected:", socket.id);

  // Attach the send function to notificationSocket object
  notificationSocket.send = (
    userId: string,
    event: string,
    notification: Notification,
  ): void => {
    // Log notification details for debugging
    console.log("Sending notification to user:", {
      user_id: userId,
      notification_id: notification.notification_id,
      message: notification.message,
      reference_id: notification.reference_id,
      type: notification.type,
      status: notification.status,
      created_at: notification.created_at,
    });

    // Use socketService to emit the notification to the specific user
    socketService.emitToAuthRoom(userId, event, notification);

    // Log confirmation
    console.log(`Notification sent to user: ${userId}`);
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
      created_at,
      updated_at,
    } = data;

    console.log(typeof data === "object");

    const userId = user.user_id;

    // Log the action of preparing to send notification
    console.log(`Preparing to send notification to user: ${userId}`);

    // Call the send method
    notificationSocket.send(userId, "notification", {
      notification_id,
      user,
      message,
      reference_id,
      type,
      status,
      created_at,
      updated_at,
    });

    // Log confirmation
    console.log(`Notification sent to user: ${userId}`);
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
  socketService.emitToRoom(userId, event, notification);
};

export default notificationSocket;
