import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import User from "../entities/User";

const getUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    console.log({ userId });

    if (!userId) {
      res.status(400).json({ message: "User ID not found in token." });
      return;
    }

    // Fetch the user from the database using TypeORM
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ user_id: userId });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      user: {
        ...user,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export default getUserInfo;
