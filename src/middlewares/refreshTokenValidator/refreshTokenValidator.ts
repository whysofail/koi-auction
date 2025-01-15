import { Request, Response, NextFunction } from "express";

const refreshTokenValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "No authorization header provided" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Invalid authorization format. Use Bearer scheme" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export default refreshTokenValidator;
