/* eslint-disable consistent-return */
import { Socket, ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";

// Define JWT secret (can be configured in environment variables)
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// This middleware applies to socket.io connections that need authentication
export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
): void => {
  try {
    // Get the authorization token from the handshake headers
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    // Remove 'Bearer ' if present
    const tokenString = token.replace("Bearer ", "");

    // Verify JWT using the secret key
    jwt.verify(
      tokenString,
      jwtSecret,
      (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // Attach user data to socket after verification
        const userData = decoded as { user_id: string; role: string };
        if (userData.role !== "admin") {
          return next(new Error("Authentication error: User is not an admin"));
        }
        const updatedSocket = socket as any;
        updatedSocket.user = userData; // Attach decoded user data to socket

        // Proceed to the next middleware or event handler
        next();
      },
    );
  } catch (error) {
    console.error("Socket authentication error:", error);
    return next(new Error("Authentication error: Invalid token"));
  }
};
