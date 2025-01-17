import { Server } from "socket.io";

class SocketIOService {
  private static instance: SocketIOService;

  private io: Server | null = null;

  // Method to get the Singleton instance
  public static getInstance(): SocketIOService {
    if (!SocketIOService.instance) {
      SocketIOService.instance = new SocketIOService();
    }
    return SocketIOService.instance;
  }

  // Initialize Socket.IO with the HTTP server
  public initialize(io: Server): void {
    if (this.io) {
      throw new Error("Socket.IO is already initialized.");
    }
    this.io = io;
  }

  // Get the Socket.IO instance
  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO instance is not initialized.");
    }
    return this.io;
  }
}

export default SocketIOService;
