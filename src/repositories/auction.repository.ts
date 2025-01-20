import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Auction from "../entities/Auction";

export const applyAuctionFilters = (
  qb: SelectQueryBuilder<Auction>,
  filters: Partial<{
    title: string;
    description: string;
    minReservePrice: number;
    maxReservePrice: number;
    startDateFrom: Date;
    startDateTo: Date;
  }> = {},
) => {
  if (filters.title) {
    qb.andWhere("auction.title ILIKE :title", { title: `%${filters.title}%` });
  }

  if (filters.description) {
    qb.andWhere("auction.description ILIKE :description", {
      description: `%${filters.description}%`,
    });
  }

  if (filters.minReservePrice !== undefined) {
    qb.andWhere("auction.reserve_price >= :minReservePrice", {
      minReservePrice: filters.minReservePrice,
    });
  }

  if (filters.maxReservePrice !== undefined) {
    qb.andWhere("auction.reserve_price <= :maxReservePrice", {
      maxReservePrice: filters.maxReservePrice,
    });
  }

  if (filters.startDateFrom) {
    qb.andWhere("auction.start_datetime >= :startDateFrom", {
      startDateFrom: filters.startDateFrom,
    });
  }

  if (filters.startDateTo) {
    qb.andWhere("auction.start_datetime <= :startDateTo", {
      startDateTo: filters.startDateTo,
    });
  }

  return qb;
};

const auctionRepository = dataSource.getRepository(Auction).extend({
  async findAuctionById(auction_id: string, filters?: any) {
    const qb = this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.item", "item")
      .leftJoin("auction.user", "user")
      .addSelect(["user.user_id", "user.username"]) // Select only the user_id and username fields
      .leftJoinAndSelect("auction.bids", "bids")
      .leftJoinAndSelect("auction.participants", "participants")
      // Join and select specific user fields inside participants
      .leftJoin("participants.user", "participant_user")
      .addSelect(["participant_user.user_id", "participant_user.username"]);

    // Add any additional condition for auction_id
    qb.where("auction.auction_id = :auction_id", { auction_id });
    applyAuctionFilters(qb, filters); // Apply filters dynamically

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

  async findAuctionWithBids(auction_id: string, filters?: any) {
    const qb = this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.bids", "bids")
      .where("auction.auction_id = :auction_id", { auction_id });

    applyAuctionFilters(qb, filters); // Apply filters dynamically

    // Await the query result
    const auction = await qb.getOne();
    // if (!auction) {
    //   throw ErrorHandler.notFound("Auction not found");
    // }
    return auction;
  },
});

export default auctionRepository;
