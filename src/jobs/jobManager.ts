import schedule, { Job } from "node-schedule";

const JobManager = {
  /**
   * Schedule a job to run at a specific date/time.
   * @param jobId Unique job identifier.
   * @param runAt Date when the job should execute.
   * @param callback Function to execute when the job runs.
   */
  scheduleJob(jobId: string, runAt: Date, callback: () => void) {
    // Cancel any existing job with the same ID
    this.cancelJob(jobId);
    // Schedule the new job
    const job: Job = schedule.scheduleJob(jobId, runAt, callback);
    return job;
  },

  /**
   * Cancel a scheduled job if it exists.
   * @param jobId Unique job identifier.
   */
  cancelJob(jobId: string) {
    if (schedule.scheduledJobs[jobId]) {
      schedule.scheduledJobs[jobId].cancel();
      console.log(`Canceled job [${jobId}]`);
    }
  },

  /**
   * Check if a job is already scheduled.
   * @param jobId Unique job identifier.
   * @returns Boolean indicating if the job exists.
   */
  isJobScheduled(jobId: string): boolean {
    return !!schedule.scheduledJobs[jobId];
  },

  /**
   * Get all scheduled jobs.
   * @returns Array of job details with next execution time and cron expression.
   */

  getScheduledJobs() {
    const jobs = schedule.scheduledJobs;
    if (Object.keys(jobs).length === 0) {
      return "No jobs scheduled.";
    }

    // Format job details for easy reading
    return Object.keys(jobs).map((jobName) => {
      const job = jobs[jobName];
      const nextInvocation = job.nextInvocation(); // Get the next invocation
      return {
        name: jobName,
        nextExecution: nextInvocation
          ? nextInvocation.toString()
          : "No next execution",
        cronExpression:
          job.pendingInvocations.length > 0
            ? job.pendingInvocations[0].recurrenceRule
            : "One-time job",
        jobStatus: job.pendingInvocations.length > 0 ? "Pending" : "Completed",
      };
    });
  },
};

export default JobManager;
