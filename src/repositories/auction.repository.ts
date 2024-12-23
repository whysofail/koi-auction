import { AppDataSource as dataSource } from "../config/data-source";
import Auction from "../entities/Auction";

const auctionRepository = dataSource.getRepository(Auction).extend({
  findAuctionById(auction_id: string) {
    return this.findOne({
      where: { auction_id },
      relations: ["item", "user", "bids"],
      select: {
        auction_id: true,
        start_datetime: true,
        end_datetime: true,
        status: true,
        current_highest_bid: true,
        reserve_price: true,
        item: {
          item_id: true,
          item_name: true,
          item_description: true,
        },
        user: {
          user_id: true,
          username: true,
          role: true,
        },
        bids: {
          bid_id: true,
          bid_amount: true,
          bid_time: true,
        },
      },
    });
  },
  findAuctionWithBids(auction_id: string) {
    return this.findOne({
      where: { auction_id },
      relations: ["bids"],
    });
  },
});

export default auctionRepository;
