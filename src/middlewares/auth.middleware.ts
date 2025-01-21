import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, AuthUser, AuthMiddleware } from "../types/auth";

export const protect: AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as AuthUser;

    // Use type assertion with Request
    Object.defineProperty(req, "user", {
      value: decoded,
      enumerable: true,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
};

export const authorize =
  (roles: string[]): AuthMiddleware =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { user } = req as AuthenticatedRequest;

    if (!roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
