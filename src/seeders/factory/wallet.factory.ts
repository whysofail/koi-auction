import { setSeederFactory } from "typeorm-extension";
import Wallet from "../../entities/Wallet";

const walletFactory = setSeederFactory(Wallet, () => {
  const wallet = new Wallet() as Pick<Wallet, "user" | "balance">;
  return wallet;
});

export default walletFactory;
