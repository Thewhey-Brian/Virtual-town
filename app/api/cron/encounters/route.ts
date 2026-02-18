import { NextRequest, NextResponse } from 'next/server';
import { detectAndProcessEncounters } from '@/lib/services/encounter-detector';
import cron, { ScheduledTask } from 'node-cron';

let scheduledTask: ScheduledTask | null = null;
let isProcessing = false;

// GET /api/cron/encounters - Check encounter detection status
export async function GET(req: NextRequest) {
  return NextResponse.json({
    isScheduled: scheduledTask !== null,
    isProcessing,
    nextRun: scheduledTask ? 'Every 15 minutes' : 'Not scheduled',
  });
}

// POST /api/cron/encounters - Start/stop/trigger encounter detection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'start') {
      if (scheduledTask) {
        scheduledTask.stop();
      }

      // Check for encounters every 15 minutes
      scheduledTask = cron.schedule('*/15 * * * *', async () => {
        if (isProcessing) {
          console.log('Encounter detection already in progress, skipping...');
          return;
        }

        console.log('Running encounter detection...');
        isProcessing = true;

        try {
          const encounters = await detectAndProcessEncounters();
          console.log(`Detected and processed ${encounters.length} encounters`);
        } catch (error) {
          console.error('Error in encounter detection:', error);
        } finally {
          isProcessing = false;
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Encounter detection started - Running every 15 minutes',
      });
    }

    if (action === 'stop') {
      if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
      }

      return NextResponse.json({
        success: true,
        message: 'Encounter detection stopped',
      });
    }

    if (action === 'trigger') {
      if (isProcessing) {
        return NextResponse.json(
          { error: 'Processing already in progress' },
          { status: 409 }
        );
      }

      isProcessing = true;
      
      const targetDate = body.date ? new Date(body.date) : new Date();
      
      detectAndProcessEncounters(targetDate)
        .then((encounters) => {
          console.log(`Manual detection: ${encounters.length} encounters found`);
        })
        .catch((error) => {
          console.error('Error in manual encounter detection:', error);
        })
        .finally(() => {
          isProcessing = false;
        });

      return NextResponse.json({
        success: true,
        message: 'Encounter detection triggered',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing encounter detection:', error);
    return NextResponse.json(
      { error: 'Failed to manage encounter detection' },
      { status: 500 }
    );
  }
}
