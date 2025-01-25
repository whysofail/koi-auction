import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { Warning } from "../../entities/Warning";
import { userService } from "../../services/user.service";

const warnUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check if the request body exists
    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const { user_id, reason } = req.body;

    // Validate if user_id is present
    if (!user_id) {
      res.status(400).json({ message: "User ID is required!" });
      return;
    }

    const user = await userService.getUserById(user_id);

    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }

    // Validate if reason is present
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      res.status(400).json({ message: "Reason is required!" });
      return;
    }

    // Create a Warning instance for validation
    const warning = new Warning();
    warning.user = user;
    warning.reason = reason;

    // Perform class-validator validation
    const errors = await validate(warning);
    if (errors.length > 0) {
      // Map the errors into a readable format
      const validationErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // If validation is successful, proceed to the next middleware
    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export default warnUserValidator;
