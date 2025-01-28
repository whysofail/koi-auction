import { Namespace } from "socket.io";
import { AuthenticatedSocket } from ".";

const adminSocketHandler = (adminNamespace: Namespace): void => {
  console.log("Admin namespace initialized.");

  // Track connected admins
  const connectedAdmins: Set<string> = new Set();

  adminNamespace.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.user) {
      console.log("Unauthorized admin connection attempt.");
      socket.disconnect(true);
      return;
    }
    console.log("Admin connected:", socket.user.user_id);
    connectedAdmins.add(socket.user.user_id);

    // Notify all admins about the new connection
    adminNamespace.emit("adminConnected", {
      message: `Admin ${socket.user.user_id} connected.`,
      totalAdmins: connectedAdmins.size,
    });

    // Handle admin joining a specific auction room for monitoring
    socket.on("monitorAuction", (auctionId: string) => {
      console.log(`Admin ${socket.id} monitoring auction: ${auctionId}`);
      socket.join(auctionId);

      // Notify the admin about the successful subscription
      socket.emit("monitoringStarted", {
        auctionId,
        message: `You are now monitoring auction: ${auctionId}`,
      });
    });

    // Handle admin sending a broadcast message to an auction room
    socket.on(
      "broadcastMessage",
      ({ auctionId, message }: { auctionId: string; message: string }) => {
        console.log(
          `Admin ${socket.id} broadcasting message to auction ${auctionId}: ${message}`,
        );
        adminNamespace.to(auctionId).emit("adminMessage", {
          from: "Admin",
          message,
          auctionId,
        });
      },
    );

    // Handle admin requesting the list of connected users in a specific auction room
    socket.on("getUsersInAuction", (auctionId: string) => {
      const clients = adminNamespace.adapter.rooms.get(auctionId);
      const userList = clients ? Array.from(clients) : [];
      socket.emit("usersInAuction", {
        auctionId,
        users: userList,
      });
    });

    // Handle admin disconnection
    socket.on("disconnect", () => {
      console.log("Admin disconnected:", socket.id);
      connectedAdmins.delete(socket.id);

      // Notify remaining admins about the disconnection
      adminNamespace.emit("adminDisconnected", {
        message: `Admin ${socket.id} disconnected.`,
        totalAdmins: connectedAdmins.size,
      });
    });
  });
};

export default adminSocketHandler;
