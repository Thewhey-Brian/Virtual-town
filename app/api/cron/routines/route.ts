import { NextRequest, NextResponse } from 'next/server';
import cron, { ScheduledTask } from 'node-cron';
import { generateAllRoutines } from '@/lib/services/routine-generator';

// Store the scheduled task
let scheduledTask: ScheduledTask | null = null;

// Track if generation is running
let isGenerating = false;

// GET /api/cron/routines - Check cron status
export async function GET(req: NextRequest) {
  return NextResponse.json({
    isScheduled: scheduledTask !== null,
    isGenerating,
    nextRun: scheduledTask ? 'Scheduled daily at 00:01' : 'Not scheduled',
  });
}

// POST /api/cron/routines - Start/stop the cron job or trigger manual run
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'start') {
      // Stop existing task if any
      if (scheduledTask) {
        scheduledTask.stop();
      }

      // Schedule daily routine generation at 00:01
      scheduledTask = cron.schedule('1 0 * * *', async () => {
        if (isGenerating) {
          console.log('Routine generation already in progress, skipping...');
          return;
        }

        console.log('Starting daily routine generation...');
        isGenerating = true;

        try {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          await generateAllRoutines(tomorrow);
          console.log('Daily routine generation completed successfully');
        } catch (error) {
          console.error('Error in daily routine generation:', error);
        } finally {
          isGenerating = false;
        }
      }, {
        timezone: 'America/Los_Angeles',
      });

      return NextResponse.json({
        success: true,
        message: 'Cron job started - Routines will generate daily at 00:01 AM',
      });
    }

    if (action === 'stop') {
      if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
      }

      return NextResponse.json({
        success: true,
        message: 'Cron job stopped',
      });
    }

    if (action === 'trigger') {
      if (isGenerating) {
        return NextResponse.json(
          { error: 'Generation already in progress' },
          { status: 409 }
        );
      }

      isGenerating = true;

      // Run in background
      const targetDate = body.date ? new Date(body.date) : new Date();
      
      generateAllRoutines(targetDate)
        .then(() => {
          console.log('Manual routine generation completed');
        })
        .catch((error) => {
          console.error('Error in manual routine generation:', error);
        })
        .finally(() => {
          isGenerating = false;
        });

      return NextResponse.json({
        success: true,
        message: `Routine generation started for ${targetDate.toDateString()}`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: start, stop, or trigger' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing cron job:', error);
    return NextResponse.json(
      { error: 'Failed to manage cron job' },
      { status: 500 }
    );
  }
}
