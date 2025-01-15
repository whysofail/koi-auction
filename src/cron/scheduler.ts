import schedule from "node-schedule";
import { authService } from "../services/auth.service";

const initializeRefreshTokenCleanup = () => {
  authService
    .cleanupRefreshTokens()
    .then(() => console.log("CRON: Initial cleanup completed"))
    .catch((err) => console.error("CRON ERR: Initial cleanup failed:", err));

  // Schedule daily cleanup at midnight
  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = "UTC";

  return schedule.scheduleJob(rule, async () => {
    try {
      await authService.cleanupRefreshTokens();
      console.log(
        "CRON: Scheduled cleanup completed at:",
        new Date().toISOString(),
      );
    } catch (error) {
      console.error("CRON ERR: Scheduled cleanup failed:", error);
    }
  });
};

export default initializeRefreshTokenCleanup;
