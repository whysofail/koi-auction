import { Server, Socket } from "socket.io";

const bidSocketHandler = (io: Server, socket: Socket): void => {
  // Handle placing a bid (Example)
  socket.on("newBid", (data) => {
    const { auctionId, bidAmount } = data;
    // Emit bid update to all clients in the room
    io.to(auctionId).emit("bidUpdate", { auctionId, bidAmount });
  });
};

export default bidSocketHandler;
