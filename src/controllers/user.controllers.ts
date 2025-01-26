import { Request, Response, NextFunction } from "express";
import { sendSuccessResponse } from "../utils/response/handleResponse";
import { userService } from "../services/user.service";
import {
  AuthenticatedRequestHandler,
  AuthenticatedRequest,
} from "../types/auth";
import { IUserOrder } from "../types/entityorder.types";

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
    const { filters, pagination, order } = req;

    const { users, count } = await userService.getAllUsers(
      filters,
      pagination,
      order as IUserOrder,
    );

    sendSuccessResponse(res, {
      data: users,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
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
