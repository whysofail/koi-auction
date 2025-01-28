/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import fs from "fs/promises";
import Transaction from "../../entities/Transaction";

const createDepositValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const proof_of_payment = req.file?.filename; // Use only the filename
  try {
    if (!req.body) {
      // Remove photo if uploaded
      if (proof_of_payment) await fs.unlink(`uploads/${proof_of_payment}`);
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    if (!proof_of_payment) {
      res.status(400).json({ message: "Missing proof of payment!" });
      return;
    }

    const requiredFields = ["amount"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      // Remove photo if uploaded
      if (proof_of_payment) await fs.unlink(`uploads/${proof_of_payment}`);
      res.status(400).json({
        message: "Missing required fields",
        missingFields, // Include missing fields in the response
      });
      return;
    }

    const amount = parseFloat(req.body.amount);

    // Validate that the amount is a valid number
    if (Number.isNaN(amount)) {
      // Remove photo if uploaded
      if (proof_of_payment) await fs.unlink(`uploads/${proof_of_payment}`);
      res.status(400).json({ message: "Invalid amount" });
      return;
    }

    const transaction = new Transaction();
    transaction.amount = amount;
    transaction.proof_of_payment = proof_of_payment ?? null;

    const errors = await validate(transaction, { skipMissingProperties: true });
    if (errors.length > 0) {
      // Remove photo if validation fails
      if (proof_of_payment) await fs.unlink(`uploads/${proof_of_payment}`);
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
    // Ensure file is removed in case of an unexpected error
    if (proof_of_payment) await fs.unlink(`uploads/${proof_of_payment}`);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export default createDepositValidator;
