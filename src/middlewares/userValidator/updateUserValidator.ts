import { Request, Response, NextFunction } from "express";
import { validate, isUUID } from "class-validator";
import User, { UserRole } from "../../entities/User";

const updateUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const { userId } = req.params;
    if (!userId || !isUUID(userId)) {
      return res.status(400).json({ message: "Invalid user ID!" });
    }

    const user = new User();
    user.user_id = userId;

    // Handle string fields
    const stringFields = ["username", "email", "password"];
    stringFields.forEach((field) => {
      if (field in req.body) {
        (user as any)[field] = req.body[field];
      }
    });

    // Handle role separately with enum validation
    if (req.body.role !== undefined) {
      if (!Object.values(UserRole).includes(req.body.role)) {
        return res.status(400).json({
          message: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}`,
        });
      }
      user.role = req.body.role;
    }

    // Handle balance with number validation
    if (req.body.balance !== undefined) {
      const balance = parseFloat(req.body.balance);
      if (Number.isNaN(balance) || balance < 0) {
        return res.status(400).json({
          message: "Balance must be a valid non-negative number",
        });
      }
      if (user.wallet) {
        user.wallet.balance = balance;
      }
    }

    const errors = await validate(user, { skipMissingProperties: true });
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
    }

    next();
    return undefined;
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export default updateUserValidator;
