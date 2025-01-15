import { setSeederFactory } from "typeorm-extension";
import { faker } from "@faker-js/faker";
import Auction from "../../entities/Auction";

const auctionsFactory = setSeederFactory(Auction, () => {
  const auction = new Auction() as Omit<Auction, "item" | "user">;
  auction.title = faker.commerce.productName();
  auction.description = faker.commerce.productDescription();
  return auction;
});

export default auctionsFactory;
