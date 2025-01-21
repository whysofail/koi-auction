import userRepository from "../repositories/user.repository";
import User from "../entities/User";
import { ErrorHandler } from "../utils/response/handleError";

export const getUserById = async (user_id: string) => {
  const user = await userRepository.findUserById(user_id);
  if (!user) {
    throw ErrorHandler.notFound(`User with ID ${user_id} not found`);
  }
  return user;
};

export const createUser = async (data: Partial<User>) => {
  try {
    const user = await userRepository.create(data);
    await userRepository.save(user);
    return user;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error creating user", error);
  }
};

export const updateUser = async (user_id: string, data: Partial<User>) => {
  try {
    const user = await userRepository.findUserById(user_id);
    if (!user) {
      throw ErrorHandler.notFound(`User with ID ${user_id} not found`);
    }
    await userRepository.update(user_id, data);
    return user;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error updating user", error);
  }
};

export const userService = {
  getUserById,
  createUser,
  updateUser,
};
