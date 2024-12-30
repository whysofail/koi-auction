import { AppDataSource as dataSource } from "../config/data-source";
import AuctionParticipant from "../entities/AuctionParticipant";

// TODO: Extend the bid repository with QueryBuilder for more complex queries
const auctionParticipantRepository = dataSource
  .getRepository(AuctionParticipant)
  .extend({
    // Fetch a auctionParticipant by ID, always include the wallet relationship
    findAuctionParticipantAuctionByAuctionId(auction_id: string) {
      return this.findOne({
        where: { auction: { auction_id } },
        relations: ["auction", "user"],
      });
    },
    findAllParticipantsByAuctionId(auction_id: string) {
      return this.find({
        where: { auction: { auction_id } },
        relations: ["auction", "user"],
      });
    },
    findAuctionParticipantByUserId(user_id: string) {
      return this.findOne({
        where: { user: { user_id } },
        relations: ["auction", "user"],
      });
    },
    findAuctionParticipantByAuctionIdAndUserId(
      auction_id: string,
      user_id: string,
    ) {
      return this.findOne({
        where: { auction: { auction_id }, user: { user_id } },
        relations: ["auction", "user"],
      });
    },
    isUserParticipatingInAuction(auction_id: string, user_id: string) {
      return this.exists({
        where: { auction: { auction_id }, user: { user_id } },
      });
    },
    findAllAuctionsByUserId(user_id: string) {
      return this.find({
        where: { user: { user_id } },
        relations: ["auction", "user"],
      });
    },
    findAuctionsByParticipantEmailOrUsername(emailOrUsername: string) {
      return this.createQueryBuilder("auctionParticipant")
        .leftJoinAndSelect("auctionParticipant.user", "user")
        .leftJoinAndSelect("auctionParticipant.auction", "auction")
        .where(
          "user.email = :emailOrUsername OR user.username = :emailOrUsername",
          { emailOrUsername },
        )
        .getMany();
    },
    findLatestParticipantByAuctionId(auction_id: string) {
      return this.createQueryBuilder("auctionParticipant")
        .leftJoinAndSelect("auctionParticipant.user", "user")
        .where("auctionParticipant.auction_id = :auction_id", { auction_id })
        .orderBy("auctionParticipant.createdAt", "DESC") // Assuming you have a `createdAt` field
        .getOne();
    },
    findAuctionsWithParticipantCount() {
      return this.createQueryBuilder("auctionParticipant")
        .select("auction.auction_id", "auctionId")
        .addSelect("COUNT(auctionParticipant.user_id)", "participantCount")
        .leftJoin("auctionParticipant.auction", "auction")
        .groupBy("auction.auction_id")
        .getRawMany();
    },
  });

export default auctionParticipantRepository;
