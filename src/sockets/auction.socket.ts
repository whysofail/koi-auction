import { Server, Socket } from "socket.io";
import Auction, { AuctionStatus } from "../entities/Auction";
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
  socket.on("joinAuction", async (auctionId: string) => {
    try {
      if (!auctionId) {
        throw new Error("Invalid auction ID");
      }
      const room = `auction:${auctionId}`;

      socket.join(room);
      log.info("user connected to auction", {
        socketId: socket.id,
        room,
        timestamp: new Date().toISOString(),
      });

      socket.emit("success", `You have joined auction: ${auctionId}`);
    } catch (error) {
      log.error("Error joining auction", { error, auctionId });
      socket.emit("error", "Failed to join auction");
    }
  });

  // Handle leaving an auction room
  socket.on("leaveAuction", (auctionId: string) => {
    const room = `auction:${auctionId}`;
    console.log(`Client ${socket.id} left auction: ${auctionId}`);
    socket.leave(room); // Leave the auction room

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
  extends Partial<Auction & AuctionParticipant & Bid & User> {
  auction_id?: string;
  bids?: Bid[];
  participants?: AuctionParticipant[];
  status?: AuctionStatus | undefined;
}

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
  try {
    if (!auctionId || !data) {
      throw new Error("Invalid update data");
    }

    const update: AuctionSocketUpdate = {
      entity: "auction",
      type,
      data: {
        auction_id: auctionId,
        ...data,
      },
    };

    await socketService.emitToRoom(`auction:${auctionId}`, "update", update);
  } catch (error) {
    log.error("Error updating auction", { error, auctionId, type });
    throw error;
  }
};

const bidUpdate = async (auctionId: string, bid: Bid): Promise<void> => {
  await auctionUpdate("BID_PLACED", auctionId, {
    bids: [
      {
        bid_id: bid.bid_id,
        bid_amount: bid.bid_amount,
        bid_time: bid.bid_time,
        user: bid.user,
        auction: bid.auction,
      },
    ],
  });
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
