import { AppDataSource as dataSource } from "../config/data-source";
import Wallet from "../entities/Wallet";

const walletRepository = dataSource.getRepository(Wallet).extend({
  async findWalletById(wallet_id: string) {
    const qb = await this.createQueryBuilder("wallet")
      .where("wallet.wallet_id = :wallet_id", { wallet_id })
      .getOne();

    if (!qb) {
      throw new Error(`Wallet with ID ${wallet_id} not found`);
    }

    return qb;
  },
  async findWalletByUserId(user_id: string) {
    const qb = await this.createQueryBuilder("wallet")
      .where("wallet.user_id = :user_id", { user_id })
      .getOne();

    if (!qb) {
      throw new Error(`Wallet not found for user with ID ${user_id}`);
    }

    return qb;
  },
});

export default walletRepository;
