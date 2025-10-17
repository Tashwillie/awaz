import { Twilio } from 'twilio';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';

export class TwilioService {
  private client: Twilio;

  constructor() {
    const env = getEnv();
    
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    }

    this.client = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  async makeOutboundCall(to: string, from: string, webhookUrl?: string): Promise<string> {
    try {
      logger.info('Making outbound call', { to: '[REDACTED]', from });

      const call = await this.client.calls.create({
        to: to,
        from: from,
        url: webhookUrl || `${process.env.NEXT_PUBLIC_API_URL}/api/voice/webhooks/twilio`,
        method: 'POST',
        statusCallback: `${process.env.NEXT_PUBLIC_API_URL}/api/voice/webhooks/twilio/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        // Add media stream configuration for Awaz integration
        record: false, // Let Awaz handle recording
        timeout: 30 // Allow time for Awaz connection
      });

      logger.info('Call initiated successfully', { callSid: call.sid });
      return call.sid;

    } catch (error) {
      logger.error('Failed to make outbound call', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getPhoneNumbers(): Promise<any[]> {
    try {
      const phoneNumbers = await this.client.incomingPhoneNumbers.list();
      return phoneNumbers.map(phone => ({
        sid: phone.sid,
        phoneNumber: phone.phoneNumber,
        friendlyName: phone.friendlyName,
        voiceUrl: phone.voiceUrl,
        status: phone.status
      }));
    } catch (error) {
      logger.error('Failed to fetch phone numbers', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async purchasePhoneNumber(areaCode?: string): Promise<any> {
    try {
      const searchCriteria: any = {
        voiceEnabled: true,
        smsEnabled: false
      };

      if (areaCode) {
        searchCriteria.areaCode = areaCode;
      }

      // First, search for available phone numbers
      const availableNumbers = await this.client.availablePhoneNumbers('US').local.list(searchCriteria);
      
      if (availableNumbers.length === 0) {
        throw new Error(`No available phone numbers found for area code ${areaCode || 'any'}`);
      }

      // Purchase the first available number
      const phoneNumber = availableNumbers[0];
      const purchasedNumber = await this.client.incomingPhoneNumbers.create({
        phoneNumber: phoneNumber.phoneNumber,
        voiceUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/voice/webhooks/twilio`,
        voiceMethod: 'POST',
        // Configure for Awaz integration
        statusCallback: `${process.env.NEXT_PUBLIC_API_URL}/api/voice/webhooks/twilio/status`,
        statusCallbackMethod: 'POST'
      });

      logger.info('Phone number purchased successfully', { 
        sid: purchasedNumber.sid, 
        phoneNumber: purchasedNumber.phoneNumber 
      });

      return {
        id: purchasedNumber.sid,
        number: purchasedNumber.phoneNumber,
        areaCode: phoneNumber.phoneNumber.substring(2, 5),
        city: phoneNumber.locality || 'Unknown',
        state: phoneNumber.region || 'Unknown',
        country: 'US',
        status: 'active',
        provider: 'twilio'
      };

    } catch (error) {
      logger.error('Failed to purchase phone number', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
}

export const twilioService = new TwilioService();
