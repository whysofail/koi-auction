import jwt from "jsonwebtoken";
import { RequestHandler, Request, Response, NextFunction } from "express";

// Extend the Express Request interface to include a user property
declare module "express" {
  export interface Request {
    user?: { user_id: string; role: string }; // Define the expected structure of the user object
  }
}

// Protect middleware to verify JWT token
export const protect: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    // Verify the token and attach the decoded data to the req.user object
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      user_id: string;
      role: string;
    };
    req.user = decoded; // Attach decoded user data to the request object
    console.log(req.user);
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Authorize middleware to check if the user has the required role
export const authorize =
  (roles: string[]): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if the user is authenticated and their role is in the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" }); // Return a Forbidden response
      return;
    }
    next(); // If authorized, move to the next middleware/handler
  };
