import Auction from "../entities/Auction";
import User from "../entities/User";
import Bid from "../entities/Bid";
import Notification from "../entities/Notification";
import AuctionParticipant from "../entities/AuctionParticipant";
import Transaction from "../entities/Transaction";
// Entity Types
export type EntityMap = {
  user: User;
  auction: Auction;
  bid: Bid;
  notification: Notification;
  auctionparticipant: AuctionParticipant;
  transaction: Transaction;
};

export type EntityName = keyof EntityMap;

// Socket Event Types
export type SocketEventType = "create" | "update" | "delete" | "admin";

// Room Types
export type RoomType = `user:${string}` | `auction:${string}` | "admin";

// Socket Message Payload
export interface SocketPayload<T extends EntityName> {
  entity: T;
  data:
    | EntityMap[T]
    | EntityMap[T][]
    | Partial<EntityMap[T]>
    | Partial<EntityMap[T]>[];
  timestamp?: number;
  metadata?: {
    action?: string;
    userId?: string;
    triggeredBy?: string;
  };
}

// Socket Response
export interface SocketResponse<T extends EntityName> {
  success: boolean;
  payload?: SocketPayload<T>;
  error?: string;
}

// Socket Emitter Types
export type SocketEmitter = <T extends EntityName>(
  event: SocketEventType,
  payload: SocketPayload<T>,
) => void;

export type RoomEmitter = <T extends EntityName>(
  room: RoomType,
  event: SocketEventType,
  payload: SocketPayload<T>,
) => void;

// Socket Connection Status
export interface SocketConnectionStatus {
  connected: boolean;
  socketId?: string;
  rooms?: RoomType[];
  lastConnected?: Date;
}

// Socket Error Types
export type SocketErrorCode =
  | "ROOM_NOT_FOUND"
  | "USER_NOT_AUTHENTICATED"
  | "INVALID_PAYLOAD"
  | "CONNECTION_ERROR";

export interface SocketError {
  code: SocketErrorCode;
  message: string;
  details?: any;
}

// Namespace Types
export type NamespaceType = "default" | "auth" | "admin";

// Socket Options
export interface SocketOptions {
  namespace?: NamespaceType;
  timeout?: number;
  retries?: number;
  ackTimeout?: number;
}
