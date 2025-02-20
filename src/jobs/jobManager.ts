import schedule, { Job as ScheduledJob } from "node-schedule";
import { Repository } from "typeorm";
import { Job, JobStatus } from "../entities/Job";
import { AppDataSource } from "../config/data-source";
import { EntityName } from "../types/socket.types";

export interface JobConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface JobHandler {
  execute(job: Job): Promise<JobResult>;
}

interface JobResult {
  success: boolean;
  error?: Error;
  data?: unknown;
}

class JobManager {
  private readonly defaultConfig: JobConfig = {
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 30000,
  };

  private jobHandlers: Map<string, JobHandler> = new Map();

  private jobRepository: Repository<Job>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
  }

  /**
   * Register a job handler for a specific job type
   */
  registerJobHandler(jobType: string, handler: JobHandler) {
    this.jobHandlers.set(jobType, handler);
    console.log(`Registered handler for job type: ${jobType}`);
  }

  /**
   * Create and schedule a new job
   */
  async createJob(
    reference_id: string,
    jobType: string,
    runAt: Date,
    entity: EntityName,
    config?: JobConfig,
  ): Promise<Job> {
    try {
      // Resolve payload if it's a Promise

      // Create job using static helper
      const job = await this.jobRepository.create({
        jobType,
        runAt,
        entity: entity as string,
        referenceId: reference_id,
        status: JobStatus.PENDING,
        jobConfig: { ...this.defaultConfig, ...config },
      });

      // Save and schedule
      await this.jobRepository.save(job);
      await this.scheduleJob(job);

      return job;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create job: ${error.message}`);
      } else {
        throw new Error("Failed to create job: Unknown error");
      }
    }
  }

  /**
   * Schedule a job from database record
   */
  private async scheduleJob(job: Job): Promise<ScheduledJob | null> {
    const handler = this.jobHandlers.get(job.jobType);

    if (!handler) {
      console.error(`No handler registered for job type: ${job.jobType}`);
      return null;
    }

    if (job.runAt < new Date()) {
      console.warn(
        `Job ${job.id} was scheduled in the past, skipping scheduling`,
      );
      return null;
    }

    const wrappedCallback = async (): Promise<JobResult | void> => {
      try {
        // Update status to running
        const updatedJob = { ...job, status: JobStatus.RUNNING };
        await this.jobRepository.save(updatedJob);

        // Set timeout for the job
        const timeoutPromise = new Promise<JobResult>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Job ${job.id} timed out after ${job.jobConfig?.timeout}ms`,
              ),
            );
          }, job.jobConfig?.timeout);
        });

        // Race between the actual job and the timeout
        const result = await Promise.race([
          handler.execute(job),
          timeoutPromise,
        ]);

        if (!result.success) {
          throw result.error || new Error("Job failed without specific error");
        }

        // Update job status to completed
        const completedJob = { ...job, status: JobStatus.COMPLETED };
        await this.jobRepository.save(completedJob);

        console.log(`Job ${job.id} completed successfully`);
        return result;
      } catch (error) {
        if (
          job.retryCount <
          (job.jobConfig?.maxRetries ?? this.defaultConfig.maxRetries ?? 5000)
        ) {
          console.warn(
            `Job ${job.id} failed, scheduling retry ${job.retryCount + 1}/${job.jobConfig?.maxRetries}`,
            {
              error: error instanceof Error ? error.message : error,
            },
          );

          // Schedule retry
          const updatedJob = this.jobRepository.create({
            ...job,
            retryCount: job.retryCount + 1,
            status: JobStatus.RETRY_QUEUED,
            runAt: new Date(
              Date.now() +
                (job.jobConfig?.retryDelay ??
                  this.defaultConfig.retryDelay ??
                  5000),
            ),
            lastError: error instanceof Error ? error.message : String(error),
          });

          await this.jobRepository.save(updatedJob);
          await this.scheduleJob(updatedJob);
        } else {
          // Update job status to failed
          const failedJob = {
            ...job,
            status: JobStatus.FAILED,
            lastError: error instanceof Error ? error.message : String(error),
          };
          await this.jobRepository.save(failedJob);

          console.error(
            `Job ${job.id} failed after ${job.retryCount} retries`,
            {
              error: error instanceof Error ? error.message : error,
            },
          );
          return { success: false, error: error as Error };
        }
      }
      return { success: true };
    };

    const scheduledJob = schedule.scheduleJob(
      job.id,
      job.runAt,
      wrappedCallback,
    );
    console.log(`Scheduled job ${job.id} for ${job.runAt}`);
    return scheduledJob;
  }

  /**
   * Initialize jobs from database on application startup
   */
  async initializeJobs() {
    try {
      // Find all pending and retry_queued jobs that haven't run yet
      const jobs = await this.jobRepository.find({
        where: [
          { status: JobStatus.PENDING },
          { status: JobStatus.RETRY_QUEUED },
        ],
      });

      console.log(`Found ${jobs.length} jobs to initialize`);

      await Promise.all(jobs.map((job) => this.scheduleJob(job)));
    } catch (error) {
      console.error("Error initializing jobs:", error);
      throw error;
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.jobRepository.findOneBy({ id: jobId });

    if (job) {
      job.status = JobStatus.CANCELLED;
      await this.jobRepository.save(job);
    }

    if (JobManager.isJobScheduled(jobId)) {
      schedule.scheduledJobs[jobId].cancel();
      console.log(`Cancelled job ${jobId}`);
    }
  }

  static isJobScheduled(jobId: string): boolean {
    return !!schedule.scheduledJobs[jobId];
  }

  static getScheduledJobs() {
    const jobs = schedule.scheduledJobs;
    if (Object.keys(jobs).length === 0) {
      return [];
    }

    return Object.entries(jobs).map(([jobName, job]) => {
      const nextInvocation = job.nextInvocation();
      return {
        id: jobName,
        nextExecution: nextInvocation?.toISOString() || null,
        cronExpression:
          job.pendingInvocations[0]?.recurrenceRule?.toString() || null,
        status: JobManager.getJobStatus(job),
        pendingInvocations: job.pendingInvocations.length,
      };
    });
  }

  private static getJobStatus(job: ScheduledJob): string {
    if (!job.nextInvocation()) {
      return "COMPLETED";
    }
    if (job.pendingInvocations.length > 0) {
      return "PENDING";
    }
    return "UNKNOWN";
  }
}

export default JobManager;
