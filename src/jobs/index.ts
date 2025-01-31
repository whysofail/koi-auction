import { initializeAuctionJobs } from "./auction.jobs";

export const initializeJobs = async () => {
  try {
    await initializeAuctionJobs();
    console.log("Auction jobs initialized.");
    // Add any additional job initializations here
    // await initializeOtherJobs();
  } catch (error) {
    console.error("Error initializing jobs:", error);
    throw new Error("Job initialization failed");
  }
};
