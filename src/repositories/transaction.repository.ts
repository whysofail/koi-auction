import { FindManyOptions } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Transaction, { TransactionStatus } from "../entities/Transaction";
import walletRepository from "./wallet.repository";

const transactionRepository = dataSource.getRepository(Transaction).extend({
  // Find a transaction by ID, including relationships
  findAllAndCount(options?: FindManyOptions<Transaction>) {
    return this.findAndCount({
      ...options,
      relations: ["wallet", "admin"], // Assuming relationships with wallet and user
    });
  },
  findTransactionById(transaction_id: string) {
    return this.findOne({
      where: { transaction_id },
      relations: ["wallet"], // Assuming relationships with wallet and user
    });
  },

  // Find transactions by wallet ID
  findTransactionsByWalletId(wallet_id: string) {
    return this.findAndCount({
      where: { wallet: { wallet_id } },
      relations: ["wallet", "user", "admin"], // Assuming relationships with wallet and user
      order: { created_at: "DESC" }, // Order by creation date
    });
  },

  findTransactionByUserId(user_id: string) {
    return this.findAndCount({
      where: { wallet: { user_id } },
      relations: ["wallet", "user", "admin"], // Assuming relationships with wallet and user
      order: { created_at: "DESC" }, // Order by creation date
    });
  },

  async createDepositTransaction(
    wallet_id: string,
    amount: number,
    proof_of_payment: string,
  ) {
    // First, fetch the Wallet instance by wallet_id
    const wallet = await walletRepository.findOne({
      where: { wallet_id },
      relations: ["user"], // Optionally include relations if needed
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Create a new transaction
    const transaction = this.create({
      wallet,
      amount,
      proof_of_payment,
      status: TransactionStatus.PENDING, // Default status when created
    });

    return this.save(transaction); // Save the transaction to the database
  },

  // Update the status of a transaction (approve, reject, etc.)
  updateTransactionStatus(transaction_id: string, status: string) {
    return this.update(
      { transaction_id },
      { status: status as TransactionStatus },
    );
  },

  // Find all transactions by status (example for admin usage)
  findTransactionsByStatus(status: TransactionStatus) {
    return this.find({
      where: { status },
      relations: ["wallet", "user", "admin"],
      order: { created_at: "DESC" },
    });
  },
});

export default transactionRepository;
