import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.middleware";
import JobManager from "../jobs/jobManager";

const jobRouter = Router();
jobRouter.get("/", protect, authorize(["admin"]), async (req, res) => {
  const jobs = JobManager.getScheduledJobs();
  res.json({ data: jobs });
});

export default jobRouter;
