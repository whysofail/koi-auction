// auth.d.ts
import { Request, RequestHandler } from "express";

// Define the user type for better reusability
export interface AuthUser {
  user_id: string;
  role: string;
}

// Properly extend Express Request
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// Custom request handler type for authenticated routes
export type AuthenticatedRequestHandler = RequestHandler<
  any, // Params type
  any, // ResBody type
  any, // ReqBody type
  any, // ReqQuery type
  Record<string, any> // Locals type
>;

// Type-safe middleware creator
export type AuthMiddleware = (
  req: Request,
  res: Response<any, Record<string, any>>,
  next: NextFunction,
) => void;
