import { runDailyCycle } from '../workflow/daily-cycle.js';

/**
 * Scheduling utilities for automated workflows
 * Note: For production, use cron jobs or cloud scheduling services
 */

const SCHEDULE = {
  // Eastern Time schedule
  RESEARCH: '09:00',  // 9 AM ET
  DRAFT: '11:00',     // 11 AM ET
  FINALIZE: '14:00',  // 2 PM ET
  PUBLISH: '16:00',   // 4 PM ET
  SOCIAL: '18:00',    // 6 PM ET
};

/**
 * Checks if it's time to run a scheduled task
 */
function isTimeToRun(scheduledTime) {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(':').map(Number);

  return now.getHours() === hours && now.getMinutes() === minutes;
}

/**
 * Run daily cycle if it's the scheduled time
 */
export async function checkAndRunDailyCycle() {
  if (isTimeToRun(SCHEDULE.RESEARCH)) {
    console.log('🕐 Scheduled time reached. Starting daily cycle...');
    await runDailyCycle();
  } else {
    console.log('⏰ Not scheduled time yet.');
  }
}

/**
 * Example: Run every hour (simple polling)
 * For production, use proper cron scheduling:
 * - Linux/Mac: crontab
 * - Cloud: AWS EventBridge, Google Cloud Scheduler, Vercel Cron
 */
export function startScheduler(intervalMinutes = 60) {
  console.log(`📅 Scheduler started. Checking every ${intervalMinutes} minutes...`);

  setInterval(async () => {
    await checkAndRunDailyCycle();
  }, intervalMinutes * 60 * 1000);
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting stopbleeding.ca scheduler\n');
  console.log('Schedule (Eastern Time):');
  Object.entries(SCHEDULE).forEach(([task, time]) => {
    console.log(`  ${task}: ${time}`);
  });
  console.log('\n');

  startScheduler(60); // Check every hour
}

export default {
  SCHEDULE,
  isTimeToRun,
  checkAndRunDailyCycle,
  startScheduler,
};
