// src/middlewares/socketAuth.middleware.ts
import { Socket, ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  user?: {
    user_id: string;
    email: string;
    // Add other user properties you need
  };
}

export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    // Remove 'Bearer ' if present
    const tokenString = token.replace("Bearer ", "");

    // Verify JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

    // Attach user data to socket
    const userData = decoded as { user_id: string; email: string };
    const updatedSocket = socket;
    updatedSocket.user = userData;

    return next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    return next(new Error("Authentication error: Invalid token"));
  }
};
