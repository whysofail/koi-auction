import { Server, Socket } from "socket.io";
import auctionSocket from "./auction.sockets";

export default function initializeSockets(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected");

    // Initialize individual socket functionalities
    auctionSocket(io, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}
