import schedule from "node-schedule";
import { LessThan } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Job, JobStatus } from "../entities/Job";

class JobCleanupService {
  private static readonly CLEANUP_SCHEDULE = "0 0 * * *"; // Run daily at midnight

  private static readonly JOB_RETENTION_DAYS = 7; // Keep completed jobs for 7 days

  private static readonly FAILED_JOB_RETENTION_DAYS = 30; // Keep failed jobs for 30 days

  private jobRepository = AppDataSource.getRepository(Job);

  /**
   * Initialize the cleanup service
   */
  initialize(): void {
    // Schedule daily cleanup
    schedule.scheduleJob(JobCleanupService.CLEANUP_SCHEDULE, () => {
      this.cleanup().catch((error) => {
        console.error("Error during job cleanup:", error);
      });
    });

    console.log("Job cleanup service initialized");
  }

  /**
   * Perform the cleanup operation
   */
  async cleanup(): Promise<void> {
    const now = new Date();
    const completedRetentionDate = new Date(
      now.getTime() -
        JobCleanupService.JOB_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    const failedRetentionDate = new Date(
      now.getTime() -
        JobCleanupService.FAILED_JOB_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );

    try {
      // Delete old completed jobs
      await this.jobRepository.delete({
        status: JobStatus.COMPLETED,
        updatedAt: LessThan(completedRetentionDate),
      });

      // Delete old failed jobs
      await this.jobRepository.delete({
        status: JobStatus.FAILED,
        updatedAt: LessThan(failedRetentionDate),
      });

      // Delete old cancelled jobs
      await this.jobRepository.delete({
        status: JobStatus.CANCELLED,
        updatedAt: LessThan(completedRetentionDate),
      });

      // Clean up stuck jobs (running for too long)
      const stuckJobs = await this.jobRepository.find({
        where: {
          status: JobStatus.RUNNING,
          updatedAt: LessThan(new Date(now.getTime() - 24 * 60 * 60 * 1000)), // Older than 24 hours
        },
      });

      if (stuckJobs.length > 0) {
        await this.jobRepository.update(
          stuckJobs.map((job) => job.id),
          {
            status: JobStatus.FAILED,
            lastError: "Job stuck in RUNNING state for more than 24 hours",
          },
        );
      }

      console.log("Job cleanup completed successfully");
    } catch (error) {
      console.error("Error during job cleanup:", error);
      throw error;
    }
  }

  /**
   * Run an immediate cleanup
   */
  async runImmediateCleanup(): Promise<void> {
    await this.cleanup();
  }
}

export const jobCleanupService = new JobCleanupService();
