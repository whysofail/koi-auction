import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import Transaction from "../../entities/Transaction";
import { deleteFileFromS3 } from "../../utils/s3";

const createDepositValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const file = req.file as MulterS3File | undefined;

    const requiredFields = ["amount"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      // Remove photo if uploaded
      if (file?.key) await deleteFileFromS3(file.key);

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
      if (file?.key) await deleteFileFromS3(file.key);

      res.status(400).json({ message: "Invalid amount" });
      return;
    }

    const transaction = new Transaction();
    transaction.amount = amount;
    transaction.proof_of_payment = file?.key ?? "";

    const errors = await validate(transaction, { skipMissingProperties: true });
    if (errors.length > 0) {
      // Remove photo if validation fails
      if (file?.key) await deleteFileFromS3(file.key);

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
    const file = req.file as MulterS3File | undefined;
    if (file?.key) await deleteFileFromS3(file.key);

    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export default createDepositValidator;
