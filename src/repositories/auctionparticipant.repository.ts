import { AppDataSource as dataSource } from "../config/data-source";
import AuctionParticipant from "../entities/AuctionParticipant";

// TODO: Extend the bid repository with QueryBuilder for more complex queries
const auctionParticipantRepository = dataSource
  .getRepository(AuctionParticipant)
  .extend({
    // Fetch a auctionParticipant by ID, always include the wallet relationship
    findAuctionParticipantAuctionById(auction_id: string) {
      return this.findOne({
        where: { auction: { auction_id } },
        relations: ["auction", "user"], // Ensure wallet relationship is always loaded
      });
    },
  });

export default auctionParticipantRepository;
