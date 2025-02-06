import { Request, Response, NextFunction } from "express";
import { isUUID } from "class-validator";
import { TransactionStatus } from "../../entities/Transaction";

const updateDepositValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const requiredFields = ["status"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const status = req.body.status?.toUpperCase(); // Convert to uppercase

    if (
      status !== TransactionStatus.APPROVED &&
      status !== TransactionStatus.REJECTED
    ) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    if (req.params.id && !isUUID(req.params.id)) {
      res.status(400).json({ message: "Invalid transaction id" });
      return;
    }

    req.body.status = status; // Ensure uppercase is used in further processing

    next();
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export default updateDepositValidator;
