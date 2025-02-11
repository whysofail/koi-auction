import { Server } from "socket.io";
import { SocketError, SocketOptions } from "../types/socket.types";

class SocketIOService {
  private static instance: SocketIOService;

  private io: Server | null = null;

  private options: SocketOptions = {
    timeout: 10000,
    retries: 3,
    ackTimeout: 5000,
  };

  public static getInstance(): SocketIOService {
    if (!SocketIOService.instance) {
      SocketIOService.instance = new SocketIOService();
    }
    return SocketIOService.instance;
  }

  public initialize(io: Server, options?: Partial<SocketOptions>): void {
    if (this.io) {
      throw new Error("Socket.IO is already initialized.");
    }
    this.options = { ...this.options, ...options };
    this.io = io;
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    if (!this.io) return;

    this.io.on("connect_error", (error: SocketError) => {
      console.error("Socket connection error:", error);
    });

    this.io.on("connect_timeout", () => {
      console.error("Socket connection timeout");
    });
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO instance is not initialized.");
    }
    return this.io;
  }

  public getOptions(): SocketOptions {
    return this.options;
  }
}

export default SocketIOService;
