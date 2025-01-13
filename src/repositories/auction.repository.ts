import { AppDataSource as dataSource } from "../config/data-source";
import Auction from "../entities/Auction";

const auctionRepository = dataSource.getRepository(Auction).extend({
  async findAuctionById(auction_id: string) {
    const qb = this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.item", "item")
      .leftJoinAndSelect("auction.user", "user")
      .leftJoinAndSelect("auction.bids", "bids")
      .leftJoinAndSelect("auction.participants", "participants")

      // Join and select specific user fields inside participants
      .leftJoin("participants.user", "participant_user")
      .addSelect(["participant_user.user_id", "participant_user.username"]);

    // Add any additional condition for auction_id
    qb.where("auction.auction_id = :auction_id", { auction_id });

    // Execute the query
    const auction = await qb.getOne();

    if (auction) {
      // Use a separate query builder to count participants
      const participantsCount = await this.createQueryBuilder("auction")
        .leftJoin("auction.participants", "participants")
        .where("auction.auction_id = :auction_id", { auction_id })
        .getCount();

      // Manually add participants_count to each participant
      auction.participants = auction.participants.map((participant) => ({
        ...participant,
        count: participantsCount,
      }));
    }

    return auction;
  },

  findAuctionWithBids(auction_id: string) {
    return this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.bids", "bids")
      .where("auction.auction_id = :auction_id", { auction_id })
      .getOne();
  },
});

export default auctionRepository;
