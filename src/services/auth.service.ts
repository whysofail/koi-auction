import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository";
import walletRepository from "../repositories/wallet.repository";
import User from "../entities/User";
import { ErrorHandler } from "../utils/response/handleError";

const ACCESS_TOKEN_EXPIRY = "1d";

const generateToken = (user: Pick<User, "user_id" | "role">) => {
  const payload = { user_id: user.user_id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET ?? "", {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const login = async (email: string, password: string) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    user_id: user.user_id,
    role: user.role,
  });

  return { token, user };
};

const register = async (
  username: string,
  email: string,
  phone: string,
  password: string,
) => {
  let parsedPhone = phone.trim().replace(/[\s-]/g, ""); // Remove spaces and dashes

  // If starts with 0, replace it with +62
  if (parsedPhone.startsWith("0")) {
    parsedPhone = `+62${parsedPhone.substring(1)}`;
  }
  // If doesn't start with +, add +62
  else if (!parsedPhone.startsWith("+")) {
    parsedPhone = `+62${parsedPhone}`;
  }

  const existingUser = await userRepository.findOne({
    where: [{ email }, { username }, { phone: parsedPhone }],
  });

  // Throw error based on same value
  if (existingUser?.email === email) {
    throw ErrorHandler.badRequest("Email already exists");
  }
  if (existingUser?.username === username) {
    throw ErrorHandler.badRequest("Username already exists");
  }
  if (existingUser?.phone === parsedPhone) {
    throw ErrorHandler.badRequest("Phone number already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Phone number: ", phone);
  console.log("Parsed phone number: ", parsedPhone);

  const newUser = userRepository.create({
    username,
    email,
    phone: parsedPhone,
    password: hashedPassword,
  });

  console.log(newUser);

  await userRepository.save(newUser);

  const wallet = walletRepository.create({
    user_id: newUser.user_id,
    balance: 0.0,
  });

  await walletRepository.save(wallet);

  return newUser.user_id;
};

export const authService = {
  login,
  register,
};
