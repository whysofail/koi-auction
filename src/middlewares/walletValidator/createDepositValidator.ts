/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import Transaction from "../../entities/Transaction";

const createDepositValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const requiredFields = ["amount", "proof_of_payment"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        message: "Missing required fields",
        missingFields, // Include missing fields in the response
      });
      return;
    }

    const transaction = new Transaction();
    transaction.amount = req.body.amount;
    transaction.proof_of_payment = req.file?.path ?? null; // `req.file` comes from the multer middleware

    const errors = await validate(transaction, { skipMissingProperties: true });
    if (errors.length > 0) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export default createDepositValidator; // Correct the exported function name
