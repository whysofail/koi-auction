import userRepository from "../repositories/user.repository";
import User from "../entities/User";
import { ErrorHandler } from "../utils/response/handleError";
import { walletService } from "./wallet.service";
import { IUserFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";
import { IUserOrder } from "../types/entityorder.types";

// Get all users with optional filters and pagination
export const getAllUsers = async (
  filters?: IUserFilter,
  pagination?: PaginationOptions,
  order?: IUserOrder,
) => {
  const { users, count } = await userRepository.getUsers(
    filters,
    pagination,
    order,
  );

  return { users, count };
};

// Get a user by ID
export const getUserById = async (user_id: string) => {
  const user = await userRepository.findUserById(user_id);

  if (!user) {
    throw ErrorHandler.notFound(`User with ID ${user_id} not found`);
  }
  return user; // Return the first (and only) user in the array
};

// Create a new user
export const createUser = async (data: Partial<User>) => {
  try {
    const user = userRepository.create(data);
    const createdUser = await userRepository.save(user);
    await walletService.createWallet(createdUser.user_id);
    return user;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error creating user", error);
  }
};

// Update a user by ID
export const updateUser = async (user_id: string, data: Partial<User>) => {
  try {
    const user = await userRepository.findOne({ where: { user_id } });

    if (!user) {
      throw ErrorHandler.notFound(`User with ID ${user_id} not found`);
    }

    await userRepository.update(user_id, data);
    return { ...user, ...data }; // Return updated user data
  } catch (error) {
    throw ErrorHandler.internalServerError("Error updating user", error);
  }
};

const getNewUserThisWeek = async () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);
  const users = await userRepository.getUsers({
    createdAtFrom: startOfWeek,
    createdAtTo: endOfWeek,
  });
  return users;
};

export const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  getNewUserThisWeek,
};
