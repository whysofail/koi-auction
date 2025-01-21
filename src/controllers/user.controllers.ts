import { Request, Response, NextFunction } from "express";
import paginate from "../utils/pagination";
import userRepository from "../repositories/user.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
import { userService } from "../services/user.service";
import {
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
} from "../types/auth";
// Get information of the logged-in user
// Use the custom type in your handler
export const getUserInfo: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Type assertion at the beginning of the handler
  const { user } = req as AuthenticatedRequest;

  try {
    const userData = await userService.getUserById(user.user_id);
    sendSuccessResponse(res, { data: userData });
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin use)
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [users, count] = await userRepository.findAndCount({
      relations: ["wallet"],
      ...paginate(req.query),
    });

    sendSuccessResponse(res, { data: users, count });
  } catch (error) {
    next(error);
  }
};

// Create a new user (Admin use)
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const newUser = await userService.createUser(req.body);
    sendSuccessResponse(res, { data: newUser });
  } catch (error) {
    next(error);
  }
};

// Update user details (Admin or self update)
export const updateUser: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  try {
    const userUpdate = await userService.updateUser(user.user_id, req.body);

    res.status(200).json({
      user: {
        ...userUpdate,
        password: undefined, // Optional, don't expose the password
      },
    });
    sendSuccessResponse(res, { data: { ...userUpdate, password: undefined } });
  } catch (error) {
    next(error);
  }
};

// Delete a user (Admin use)
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { user_id } = req.params;

    // Check if the user exists
    const user = await userRepository.findUserById(user_id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Delete the user
    await userRepository.delete({ user_id });
    sendSuccessResponse(res, { message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    sendErrorResponse(res, "Internal server error.");
  }
};
