/* eslint-disable class-methods-use-this */
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { hash } from "bcrypt";
import User, { UserRole } from "../entity/User";
import Item from "../entity/Item";
import Auction from "../entity/Auction";

export default class MainSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const userRepository = dataSource.getRepository(User);
    const ItemRepository = dataSource.getRepository(Item);
    const auctionRepository = dataSource.getRepository(Auction);

    const existingUserCount = await userRepository.count();
    if (existingUserCount > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    const userFactory = factoryManager.get(User);
    const itemFactory = factoryManager.get(Item);
    const auctionFactory = factoryManager.get(Auction);

    const users = await Promise.all(
      Array.from({ length: 5 }, async (_, index) =>
        userFactory.make({
          username: `user-${index}`,
          email: `user-${index}@mail.com`,
          password: await hash(`user-${index}`, 12),
        }),
      ),
    );

    const admins = await Promise.all(
      Array.from({ length: 2 }, async (_, index) =>
        userFactory.make({
          username: `admin-${index}`,
          email: `admin-${index}@mail.com`,
          role: UserRole.ADMIN,
          password: await hash(`admin-${index}`, 12),
        }),
      ),
    );

    const items = await Promise.all(
      Array.from({ length: 10 }, () =>
        itemFactory.make({
          user: admins[Math.floor(Math.random() * admins.length)],
        }),
      ),
    );

    await userRepository.save([...users, ...admins]);
    await ItemRepository.save(items);

    const auctions = await Promise.all(
      Array.from({ length: 2 }, () =>
        auctionFactory.make({
          user: admins[Math.floor(Math.random() * admins.length)],
          item: items[Math.floor(Math.random() * items.length)],
        }),
      ),
    );

    await auctionRepository.save(auctions);
  }
}
