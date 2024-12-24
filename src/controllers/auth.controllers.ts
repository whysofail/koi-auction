import { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../entities/User";
import userRepository from "../repositories/user.repository";

// Define the login function with correct return type
export const login: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password }: User = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ message: "Email and password are required", req: req.body });
    return;
  }

  try {
    // Find the user by email
    const user = await userRepository.findUserByEmail(email);
    // If no user is found
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return; // Explicitly return after response to ensure no further execution
    }

    // Check if the password matches the stored password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET || "",
      {
        expiresIn: "1h",
      },
    );

    // Respond with the token and user info (excluding password)
    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Handle server error
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Define the register function with correct return type
export const register: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return; // Explicitly return after response to ensure no further execution
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = hashedPassword;

    await userRepository.save(newUser);

    const token = jwt.sign(
      { id: newUser.user_id },
      process.env.JWT_SECRET || "",
      {
        expiresIn: "1h",
      },
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.user_id,
        name: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
