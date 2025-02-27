import { Request, Response, NextFunction } from "express";
import { isUUID } from "class-validator";
import { TransactionStatus } from "../../entities/Transaction";
import transactionRepository from "../../repositories/transaction.repository";

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
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing transaction id" });
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

    const transaction = await transactionRepository.findTransactionById(id);
    if (!transaction) {
      res.status(404).json({ message: `Transaction with ID ${id} not found` });
      return;
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      res.status(400).json({ message: "Transaction is not pending" });
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
