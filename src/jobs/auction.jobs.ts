import Auction, { AuctionStatus } from "../entities/Auction";
import auctionRepository from "../repositories/auction.repository";
import JobManager from "./jobManager";

/**
 * Schedule an auction start job.
 * @param auction The auction entity.
 */
export const schedule = (auction: Auction) => {
  if (!auction.start_datetime || !auction.auction_id) {
    console.log(
      `Invalid auction data: ${auction.auction_id} or ${auction.start_datetime}`,
    );
    return;
  }

  // Scheduling the job to start the auction at localStartDatetime
  JobManager.scheduleJob(
    auction.auction_id,
    auction.start_datetime, // Use the local start time for the job
    async () => {
      const auctionToUpdate = await auctionRepository.findOneBy({
        auction_id: auction.auction_id,
      });

      if (
        auctionToUpdate &&
        auctionToUpdate.status === AuctionStatus.PUBLISHED
      ) {
        auctionToUpdate.status = AuctionStatus.STARTED;
        await auctionRepository.save(auctionToUpdate);
        console.log(`Auction [${auctionToUpdate.auction_id}] started.`);
      } else {
        console.log(
          `Auction [${auction.auction_id}] not found or already started.`,
        );
      }
    },
  );
};

/**
 * Cancel an auction job.
 * @param auctionId Auction ID.
 */
export const cancel = (auctionId: string) => {
  JobManager.cancelJob(auctionId);
  console.log(`Canceled auction job [${auctionId}].`);
};

/**
 * Initialize all scheduled auction jobs.
 */
export const initializeAuctionJobs = async () => {
  try {
    const auctions = await auctionRepository.find({
      where: { status: AuctionStatus.PUBLISHED },
    });

    auctions.forEach((auction) => {
      schedule(auction); // Pass the whole auction object
    });

    console.log(`Scheduled ${auctions.length} auction jobs.`);
  } catch (error) {
    console.error("Error initializing auction jobs:", error);
  }
};

export const auctionJobs = {
  schedule,
  cancel,
  initializeAuctionJobs,
};
