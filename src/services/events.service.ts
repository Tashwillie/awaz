import { logger } from '@/lib/logger';
import { getEnv } from '@/lib/env';

export class EventsService {
  private slackWebhookUrl?: string;

  constructor() {
    const env = getEnv();
    this.slackWebhookUrl = env.SLACK_WEBHOOK_URL;
  }

  async fanOutEvent(event: {
    type: string;
    callId: string;
    lead: { name?: string; phone: string; email?: string };
    summary?: string;
    transcriptUrl?: string;
    booking?: any;
  }): Promise<void> {
    logger.info('Fanning out event', { type: event.type, callId: event.callId });

    await Promise.allSettled([
      this.sendToCRM(event),
      this.sendToCalendar(event),
      this.sendToSlack(event),
      this.sendToSheet(event),
    ]);
  }

  private async sendToCRM(event: any): Promise<void> {
    logger.info('Sending to CRM', { callId: event.callId });
    
    const env = getEnv();
    
    if (env.CRM === 'hubspot' && env.HUBSPOT_API_KEY) {
      await this.sendToHubspot(event);
    } else if (env.CRM === 'pipedrive' && env.PIPEDRIVE_API_TOKEN) {
      await this.sendToPipedrive(event);
    } else {
      logger.info('CRM not configured or missing API key');
    }
  }

  private async sendToHubspot(event: any): Promise<void> {
    logger.info('Sending to HubSpot', { callId: event.callId });
  }

  private async sendToPipedrive(event: any): Promise<void> {
    logger.info('Sending to Pipedrive', { callId: event.callId });
  }

  private async sendToCalendar(event: any): Promise<void> {
    logger.info('Sending to Calendar', { callId: event.callId });
    
    const env = getEnv();
    
    if (env.CALENDAR === 'google' && env.GOOGLE_CALENDAR_CREDENTIALS_BASE64) {
      await this.sendToGoogleCalendar(event);
    } else if (env.CALENDAR === 'calendly' && env.CALENDLY_TOKEN) {
      await this.sendToCalendly(event);
    } else {
      logger.info('Calendar not configured or missing credentials');
    }
  }

  private async sendToGoogleCalendar(event: any): Promise<void> {
    logger.info('Sending to Google Calendar', { callId: event.callId });
  }

  private async sendToCalendly(event: any): Promise<void> {
    logger.info('Sending to Calendly', { callId: event.callId });
  }

  private async sendToSlack(event: any): Promise<void> {
    if (!this.slackWebhookUrl) {
      logger.info('Slack webhook not configured');
      return;
    }

    logger.info('Sending to Slack', { callId: event.callId });

    try {
      await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New call event: ${event.type}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Call Event:* ${event.type}\n*Call ID:* ${event.callId}\n*Lead:* ${event.lead.name || 'Unknown'} (${event.lead.phone})`,
              },
            },
          ],
        }),
      });
    } catch (error) {
      logger.error('Failed to send to Slack', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async sendToSheet(event: any): Promise<void> {
    logger.info('Sending to Google Sheet', { callId: event.callId });
  }
}







