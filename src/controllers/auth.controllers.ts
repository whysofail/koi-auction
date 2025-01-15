import { RequestHandler } from "express";
import { authService } from "../services/auth.service";

const loginController: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        user_id: result.user.user_id,
        name: result.user.username,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const registerController: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user_id = await authService.register(username, email, password);
    res.status(200).json({ message: "User registered successfully", user_id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const refreshTokenController: RequestHandler = async (req, res) => {
  try {
    const refreshToken = req.headers.authorization?.split(" ")[1] as string;

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAuth(refreshToken);

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "No bearer token provided") {
        res.status(401).json({ error: "No bearer token provided" });
      } else if (
        error.message === "Invalid refresh token" ||
        error.message === "Refresh token expired" ||
        error.message === "Refresh token has been revoked"
      ) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const revokeTokenController: RequestHandler = async (req, res) => {
  try {
    const refreshToken = req.headers.authorization?.split(" ")[1] as string;
    await authService.revokeToken(refreshToken);
    res.status(200).json({ message: "Refresh token revoked" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "No bearer token provided") {
        res.status(401).json({ error: "No bearer token provided" });
      } else if (
        error.message === "Invalid refresh token" ||
        error.message === "Refresh token expired" ||
        error.message === "Refresh token has been revoked"
      ) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export {
  loginController,
  registerController,
  refreshTokenController,
  revokeTokenController,
};
