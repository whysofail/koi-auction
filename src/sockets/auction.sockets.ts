import { Server, Socket } from "socket.io";

const auctionSocketHandler = (io: Server, socket: Socket): void => {
  console.log("New client connected:", socket.id);

  // Handle joining an auction room
  socket.on("joinAuction", (auctionId: string) => {
    console.log(`Client joined auction: ${auctionId}`);
    socket.join(auctionId); // Join a specific auction room
  });

  // Handle new bid events
  socket.on("newBid", ({ auctionId, bidAmount }) => {
    console.log(`New bid for auction ${auctionId}: ${bidAmount}`);
    // Broadcast the new bid to all clients in the auction room
    io.to(auctionId).emit("bidUpdate", { bidAmount });
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
};

export default auctionSocketHandler;
