import { Namespace, Server } from "socket.io";
import Transaction from "../entities/Transaction";
import socketService from "../services/socket.service";
import { AuthenticatedSocket } from ".";
import transactionRepository from "../repositories/transaction.repository";

interface TransactionUpdateData extends Partial<Transaction> {}
type TransactionUpdateType = "DEPOSIT_UPDATE";

interface TransactionSocketUpdate {
  entity: "transaction";
  type: TransactionUpdateType;
  data: TransactionUpdateData;
}
const transactionSocket = (
  io: Server | Namespace,
  socket: AuthenticatedSocket,
): void => {
  socket.on("disconnect", () => {
    console.log("Client disconnected from /auth transaction");
  });
};
export default transactionSocket;

const transactionUpdate = async (
  type: TransactionUpdateType,
  transactionId: string,
  data: Partial<TransactionUpdateData>,
): Promise<void> => {
  try {
    if (!transactionId || !data) {
      throw new Error("Invalid update data");
    }

    const update: TransactionSocketUpdate = {
      entity: "transaction",
      type,
      data: {
        transaction_id: transactionId,
        ...data,
      },
    };
    const transaction =
      await transactionRepository.findTransactionById(transactionId);

    if (transaction) {
      socketService.emitToAuthenticatedUser(
        transaction?.wallet.user_id,
        "update",
        update,
      );
    }
    socketService.emitToNamespace("admin", "update", update);
  } catch (error) {
    console.error("Error updating transaction", { error, transactionId, type });
    throw error;
  }
};

export const transactionEmitter = {
  transactionUpdate,
};
