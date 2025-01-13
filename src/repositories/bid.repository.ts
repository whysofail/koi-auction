import { FindManyOptions } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Bid from "../entities/Bid";

// Extend the base repository with additional methods
const bidRepository = dataSource.getRepository(Bid).extend({
  findAllAndCount(options?: FindManyOptions<Bid>) {
    return this.findAndCount({
      ...options,
      relations: ["auction", "user"],
      select: {
        user: {
          user_id: true,
          username: true,
        },
      },
    });
  },
  findBidById(bid_id: string) {
    return this.findOne({
      where: { bid_id },
      relations: ["auction", "user"],
    });
  },
  findBidByAuctionId(auction_id: string) {
    return this.findAndCount({
      where: { auction: { auction_id } }, // Assuming auction has auction_id as its property
      relations: ["auction", "user"], // Include relations if necessary
    });
  },
  findBidByUserId(user_id: string) {
    return this.find({
      where: { user: { user_id } },
      relationLoadStrategy: "join",
      relations: ["auction"],
    });
  },
});

export default bidRepository;
