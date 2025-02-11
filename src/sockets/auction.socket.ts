import { Server, Socket } from "socket.io";

const userRooms: Record<string, Set<string> | undefined> = {};

const auctionSocketHandler = (io: Server, socket: Socket): void => {
  // Handle joining an auction room
  socket.on("joinAuction", (auctionId: string) => {
    console.log(`Client ${socket.id} joined auction: ${auctionId}`);
    socket.join(auctionId); // Join the auction room

    // Add the user to the auction room's set of users
    if (!userRooms[auctionId]) {
      userRooms[auctionId] = new Set();
    }
    userRooms[auctionId].add(socket.id);

    // Emit the updated list of users to all clients in the auction room
    io.to(auctionId).emit("userListUpdate", Array.from(userRooms[auctionId]));

    // Notify the client that they joined the auction successfully
    socket.emit("success", `You have joined auction: ${auctionId}`);
  });

  // Handle leaving an auction room
  socket.on("leaveAuction", (auctionId: string) => {
    console.log(`Client ${socket.id} left auction: ${auctionId}`);
    socket.leave(auctionId); // Leave the auction room

    // Remove the user from the auction room's set of users
    if (userRooms[auctionId]) {
      userRooms[auctionId].delete(socket.id);

      // Emit the updated list of users to all clients in the auction room
      io.to(auctionId).emit("userListUpdate", Array.from(userRooms[auctionId]));

      // Cleanup if no users remain in the room
      if (userRooms[auctionId].size === 0) {
        userRooms[auctionId] = undefined;
      }
    }

    // Notify the client that they left the auction successfully
    socket.emit("success", `You have left auction: ${auctionId}`);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Remove the user from all rooms they were in
    Object.keys(userRooms).forEach((auctionId) => {
      if (userRooms[auctionId] && userRooms[auctionId].has(socket.id)) {
        userRooms[auctionId].delete(socket.id);
        io.to(auctionId).emit(
          "userListUpdate",
          Array.from(userRooms[auctionId]),
        );

        // Cleanup if no users remain in the room
        if (userRooms[auctionId].size === 0) {
          userRooms[auctionId] = undefined;
        }
      }
    });
  });
};

export default auctionSocketHandler;
