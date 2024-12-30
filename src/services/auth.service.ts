import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository";
import walletRepository from "../repositories/wallet.repository";

const generateToken = (payload: { user_id: string; role: string }) =>
  jwt.sign(payload, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });

const login = async (email: string, password: string) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const generatedToken = generateToken({
    user_id: user.user_id,
    role: user.role,
  });

  return { token: generatedToken, user };
};

const register = async (username: string, email: string, password: string) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    username,
    email,
    password: hashedPassword,
  });

  await userRepository.save(newUser);

  const wallet = walletRepository.create({
    user_id: newUser.user_id,
    balance: 0.0,
  });

  await walletRepository.save(wallet);

  return newUser.user_id;
};

export const authService = { login, register };
