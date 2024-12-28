import { AppDataSource as dataSource } from "../config/data-source";
import Wallet from "../entities/Wallet";

const walletRepository = dataSource.getRepository(Wallet).extend({
  findWalletById(wallet_id: string) {
    return this.createQueryBuilder("wallet")
      .where("wallet.wallet_id = :wallet_id", { wallet_id })
      .getOne();
  },
  findWalletByUserId(user_id: string) {
    return this.createQueryBuilder("wallet")
      .where("wallet.user_id = :user_id", { user_id })
      .getOne();
  },
});

export default walletRepository;
