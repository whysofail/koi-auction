import { RequestHandler, Request, Response } from "express";
import paginate from "../utils/pagination";
import userRepository from "../repositories/user.repository";

// Get information of the logged-in user
export const getUserInfo: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(400).json({ message: "User ID not found in token." });
      return;
    }

    const user = await userRepository.findUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      user: {
        ...user,
        password: undefined, // Optional, don't expose the password
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all users (Admin use)
export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await userRepository.findAndCount({
      ...paginate(req.query),
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Create a new user (Admin use)
export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    // Check if the user already exists
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists." });
      return;
    }

    const newUser = userRepository.create({
      username,
      email,
      password,
      role,
    });

    await userRepository.save(newUser);

    res.status(201).json({
      user: {
        ...newUser,
        password: undefined, // Optional, don't expose the password
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update user details (Admin or self update)
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    const { username, email, password, role } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID not found in token." });
      return;
    }

    // Find user by user_id
    const user = await userRepository.findUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Update user properties if provided
    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;
    user.role = role || user.role;

    await userRepository.save(user);

    res.status(200).json({
      user: {
        ...user,
        password: undefined, // Optional, don't expose the password
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error." });
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

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
