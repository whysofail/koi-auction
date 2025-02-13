import { Server, Socket } from "socket.io";
import Auction from "../entities/Auction";
import Bid from "../entities/Bid";
import socketService from "../services/socket.service";
import AuctionParticipant from "../entities/AuctionParticipant";
import User from "../entities/User";

const userRooms: Record<string, Set<string> | undefined> = {};

const log = {
  info: (message: string, data?: any) => console.log(message, data || ""),
  warn: (message: string, data?: any) => console.warn(message, data || ""),
  error: (message: string, data?: any) => console.error(message, data || ""),
};

const auctionSocketHandler = (io: Server, socket: Socket): void => {
  // Handle joining an auction room
  socket.on("joinAuction", (auctionId: string) => {
    const room = `auction:${auctionId}`;
    console.log(room);
    console.log(`Client ${socket.id} joined auction: ${auctionId}`);
    socket.join(room); // Join the auction room

    log.info("user connected to auction", {
      socketId: socket.id,
      rooms: Array.from(socket.rooms),
    });

    // Add the user to the auction room's set of users
    if (!userRooms[room]) {
      userRooms[room] = new Set();
    }
    userRooms[room].add(socket.id);

    // Emit the updated list of users to all clients in the auction room
    io.to(auctionId).emit("userListUpdate", Array.from(userRooms[room]));

    // Notify the client that they joined the auction successfully
    socket.emit("success", `You have joined auction: ${auctionId}`);
  });

  // Handle leaving an auction room
  socket.on("leaveAuction", (auctionId: string) => {
    const room = `auction:${auctionId}`;
    console.log(`Client ${socket.id} left auction: ${auctionId}`);
    socket.leave(room); // Leave the auction room

    // Remove the user from the auction room's set of users
    if (userRooms[room]) {
      userRooms[room].delete(socket.id);

      // Emit the updated list of users to all clients in the auction room
      io.to(auctionId).emit("userListUpdate", Array.from(userRooms[room]));

      // Cleanup if no users remain in the room
      if (userRooms[room].size === 0) {
        userRooms[room] = undefined;
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

type AuctionUpdateType =
  | "PARTICIPANT_JOINED"
  | "BID_PLACED"
  | "STATUS_CHANGED"
  | "AUCTION_UPDATED";

interface AuctionUpdateData
  extends Partial<Auction & AuctionParticipant & Bid & User> {}

interface AuctionSocketUpdate {
  entity: "auction";
  type: AuctionUpdateType;
  data: AuctionUpdateData;
}

const auctionUpdate = async (
  type: AuctionUpdateType,
  auctionId: string,
  data: Partial<AuctionUpdateData>,
): Promise<void> => {
  const update: AuctionSocketUpdate = {
    entity: "auction",
    type,
    data: {
      auction_id: auctionId,
      ...data,
    },
  };

  await socketService.emitToRoom(`auction:${auctionId}`, "update", update);
};

const bidUpdate = async (auctionId: string, bid: Bid): Promise<void> => {
  await auctionUpdate("BID_PLACED", auctionId, bid);
};

const participantUpdate = async (
  auctionId: string,
  participant: AuctionParticipant,
): Promise<void> => {
  await auctionUpdate("PARTICIPANT_JOINED", auctionId, participant);
};

export const auctionEmitter = {
  auctionUpdate,
  bidUpdate,
  participantUpdate,
};

export default auctionSocketHandler;
