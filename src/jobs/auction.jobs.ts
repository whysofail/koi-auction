import Auction, { AuctionStatus } from "../entities/Auction";
import auctionRepository from "../repositories/auction.repository";
import JobManager, { JobHandler } from "./jobManager";

const jobManager = new JobManager();

// Define the auction start handler
const auctionStartHandler: JobHandler = {
  execute: async (job): Promise<{ success: boolean; error?: Error }> => {
    try {
      const auctionToUpdate = await auctionRepository.findOneBy({
        auction_id: job.referenceId,
      });

      if (
        !auctionToUpdate ||
        auctionToUpdate.status !== AuctionStatus.PUBLISHED
      ) {
        throw new Error(
          `Auction [${job.referenceId}] not found or not in PUBLISHED state`,
        );
      }

      auctionToUpdate.status = AuctionStatus.STARTED;
      await auctionRepository.save(auctionToUpdate);
      console.log(`Auction [${auctionToUpdate.auction_id}] started.`);

      return { success: true };
    } catch (error) {
      console.error(
        `Error while starting auction [${job.referenceId}]:`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
};

// Register the handler
jobManager.registerJobHandler("start-auction", auctionStartHandler);

/**
 * Schedule an auction start job.
 * @param auction The auction entity.
 */
export const schedule = async (auction: Auction): Promise<void> => {
  if (!auction.start_datetime || !auction.auction_id) {
    console.log(
      `Invalid auction data: ${auction.auction_id} or ${auction.start_datetime}`,
    );
    return;
  }

  try {
    await jobManager.createJob(
      auction.auction_id,
      "start-auction",
      auction.start_datetime,
      "auction",
    );

    console.log(`Scheduled start job for auction [${auction.auction_id}]`);
  } catch (error) {
    console.error("Error scheduling auction job:", error);
    throw error;
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
