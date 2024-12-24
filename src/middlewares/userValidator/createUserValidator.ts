import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import User, { UserRole } from "../../entities/User";

const createUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    // Check required fields
    const requiredFields = ["username", "email", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const user = new User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = req.body.password;

    // Handle optional fields
    if (req.body.role !== undefined) {
      if (!Object.values(UserRole).includes(req.body.role)) {
        return res.status(400).json({
          message: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}`,
        });
      }
      user.role = req.body.role;
    }

    if (req.body.balance !== undefined) {
      const balance = parseFloat(req.body.balance);
      if (Number.isNaN(balance) || balance < 0) {
        return res.status(400).json({
          message: "Balance must be a valid non-negative number",
        });
      }
      user.balance = balance;
    }

    const errors = await validate(user);
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

export default createUserValidator;
