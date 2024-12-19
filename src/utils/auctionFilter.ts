/* eslint-disable @typescript-eslint/naming-convention */
import { FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import Auction, { AuctionStatus } from "../entities/Auction";

// Define the type for the query params
interface AuctionQueryParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

// Function to build the where condition based on query parameters
const buildAuctionFilters = (
  query: AuctionQueryParams,
): FindOptionsWhere<Auction> => {
  const { status, start_date, end_date } = query;

  const whereCondition: FindOptionsWhere<Auction> = {};

  // Apply status filter if present and valid
  if (
    status &&
    Object.values(AuctionStatus).includes(status.toUpperCase() as AuctionStatus)
  ) {
    whereCondition.status = status.toUpperCase() as AuctionStatus; // Convert status to uppercase
  }

  // Apply date range filter if both start_date and end_date are present
  if (start_date || end_date) {
    if (start_date) {
      whereCondition.start_time = MoreThanOrEqual(new Date(start_date)); // greater than or equal to
    }

    if (end_date) {
      whereCondition.end_time = LessThanOrEqual(new Date(end_date)); // less than or equal to
    }
  }

  return whereCondition;
};

export default buildAuctionFilters;
