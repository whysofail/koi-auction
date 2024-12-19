import { Server, Socket } from "socket.io";

const userRooms: Record<string, Set<string>> = {}; // Track users per auction room

const auctionSocketHandler = (io: Server, socket: Socket): void => {
  console.log("New client connected:", socket.id);

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

  // Handle placing a bid (Example)
  socket.on("newBid", (data) => {
    const { auctionId, bidAmount } = data;
    // Emit bid update to all clients in the room
    io.to(auctionId).emit("bidUpdate", { auctionId, bidAmount });
  });

  // Handle request for users in auction
  socket.on("getUsersInAuction", (auctionId: string) => {
    // Emit the list of users in the specified auction room to the client
    const users = userRooms[auctionId] ? Array.from(userRooms[auctionId]) : [];
    socket.emit("usersInAuction", users);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Remove the user from all rooms they were in
    Object.keys(userRooms).forEach((auctionId) => {
      if (userRooms[auctionId].has(socket.id)) {
        userRooms[auctionId].delete(socket.id);
        io.to(auctionId).emit(
          "userListUpdate",
          Array.from(userRooms[auctionId]),
        );
      }
    });
  });
};

export default auctionSocketHandler;
