import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository";
import walletRepository from "../repositories/wallet.repository";
import User, { UserRole } from "../entities/User";
import refreshTokenRepository from "../repositories/refreshTokenRepository";

const ACCESS_TOKEN_EXPIRY = "1m";
const REFRESH_TOKEN_EXPIRY = "7d";

const generateTokens = async (user: Pick<User, "user_id" | "role">) => {
  const payload = { user_id: user.user_id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET ?? "", {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET ?? "",
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    },
  );

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await refreshTokenRepository.createToken(
    refreshToken,
    user.user_id,
    expiryDate,
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (token: string) => {
  try {
    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET ?? "",
    ) as {
      user_id: string;
      role: string;
    };

    const tokenEntity = await refreshTokenRepository.findValidToken(token);

    if (!tokenEntity) {
      throw new Error("Invalid or expired refresh token");
    }

    return { tokenEntity, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired");
    }
    throw new Error("Invalid refresh token");
  }
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

  const tokens = await generateTokens({
    user_id: user.user_id,
    role: user.role,
  });

  return { ...tokens, user };
};

const refreshAuth = async (refreshToken: string) => {
  const { payload } = await verifyRefreshToken(refreshToken);

  await refreshTokenRepository.revokeToken(refreshToken);

  return generateTokens({
    user_id: payload.user_id,
    role: payload.role as UserRole,
  });
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

const revokeToken = async (refreshToken: string) => {
  await refreshTokenRepository.revokeToken(refreshToken);
};

export const authService = { login, register, refreshAuth, revokeToken };
