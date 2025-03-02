import { initializeAuctionJobs } from "./auction.jobs";
import { jobCleanupService } from "../services/job-cleanup.service";

export const initializeJobs = async () => {
  try {
    // Initialize job cleanup service
    jobCleanupService.initialize();
    console.log("Job cleanup service initialized.");

    // Initialize auction jobs
    await initializeAuctionJobs();
    console.log("Auction jobs initialized.");
    // Add any additional job initializations here
    // await initializeOtherJobs();
  } catch (error) {
    console.error("Error initializing jobs:", error);
    throw new Error("Job initialization failed");
  }
};
