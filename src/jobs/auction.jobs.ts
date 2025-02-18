import Auction, { AuctionStatus } from "../entities/Auction";
import auctionRepository from "../repositories/auction.repository";
import JobManager from "./jobManager";

const jobManager = new JobManager();

/**
 * Schedule an auction start job.
 * @param auction The auction entity.
 */
export const schedule = async (auction: Auction) => {
  if (!auction.start_datetime || !auction.auction_id) {
    console.log(
      `Invalid auction data: ${auction.auction_id} or ${auction.start_datetime}`,
    );
    return;
  }

  // Scheduling the job to start the auction at localStartDatetime
  try {
    await jobManager.createJob(
      auction.auction_id,
      "start-auction",
      auction.start_datetime, // Use the local start time for the job
      async () => {
        try {
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
        } catch (error) {
          console.error(
            `Error while starting auction [${auction.auction_id}]:`,
            error,
          );
        }
      },
    );
  } catch (error) {
    console.error("Error scheduling auction job:", error);
  }
};

/**
 * Cancel an auction job.
 * @param auctionId Auction ID.
 */
export const cancel = (auctionId: string) => {
  jobManager.cancelJob(auctionId);
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

    await Promise.all(auctions.map((auction) => schedule(auction)));

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
