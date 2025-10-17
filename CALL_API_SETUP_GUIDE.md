# Call Button API Setup Guide

## Overview
The "Call" button in your dashboard's Test Agent step needs several APIs to work properly. Currently, it's set up with mock data, but here's what you need to connect for real functionality.

## APIs Required for Call Functionality

### 1. **Twilio API** (Primary Call Provider)
**Purpose**: Handle actual phone calls
**Status**: ⚠️ Needs Configuration

**What you need:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Setup Steps:**
1. Create Twilio account at https://twilio.com
2. Get your Account SID and Auth Token from console
3. Purchase a phone number
4. Add credentials to your `.env.local` file

### 2. **Voice Provider APIs** (AI Conversation)
**Purpose**: Handle AI voice interactions during calls
**Status**: ⚠️ Needs Configuration

**Available Providers:**

#### Option A: Retell AI
```env
VOICE_PROVIDER=retell
RETELL_API_KEY=your_retell_api_key
```

#### Option B: Vapi
```env
VOICE_PROVIDER=vapi
VAPI_API_KEY=your_vapi_api_key
```

#### Option C: Awaz (You have this partially configured)
```env
VOICE_PROVIDER=awaz
AWAZ_API_KEY=1606d722-63fa-49f8-9ccb-5529463d3fb1
```

### 3. **Phone Number Provisioning API**
**Purpose**: Get and manage phone numbers for agents
**Status**: ✅ Backend API Ready (Mock Implementation)

**Endpoint**: `POST /api/dashboard/agent/phone`
**Current Implementation**: Returns mock phone numbers

### 4. **Test Call Initiation API**
**Purpose**: Start test calls from the dashboard
**Status**: ✅ Backend API Ready (Mock Implementation)

**Endpoint**: `POST /api/dashboard/agent/test-calls`
**Current Implementation**: Returns success message (no actual call)

## Current Implementation Status

### ✅ **Working (Mock Data)**
- Call button UI renders correctly
- API endpoints respond with mock data
- Frontend can make API calls
- Phone number display works

### ⚠️ **Needs Real API Connection**
- Actual phone calls (Twilio integration)
- AI voice responses (Voice provider integration)
- Real phone number provisioning
- Call status tracking

## Quick Setup for Testing

### Option 1: Use Existing Awaz Integration
Since you already have `AWAZ_API_KEY`, you can:

1. **Set voice provider to Awaz:**
```env
VOICE_PROVIDER=awaz
AWAZ_API_KEY=1606d722-63fa-49f8-9ccb-5529463d3fb1
```

2. **Add Twilio credentials:**
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Option 2: Use Retell (Recommended for Testing)
Retell has a good free tier and easy setup:

1. **Sign up at Retell AI**
2. **Get API key**
3. **Configure environment:**
```env
VOICE_PROVIDER=retell
RETELL_API_KEY=your_retell_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Implementation Files to Update

### 1. **Backend API Integration**
- `app/api/dashboard/agent/test-calls/route.ts` - Add real Twilio call logic
- `app/api/dashboard/agent/phone/route.ts` - Add real phone number provisioning
- `src/services/providers/voice/` - Configure voice provider integration

### 2. **Environment Configuration**
- Create `.env.local` with API keys
- Configure voice provider settings
- Set up Twilio credentials

## Testing the Call Button

Once APIs are connected:

1. **Click "Call" button** → Triggers `handleTestCall()` in `TestAgentStep.tsx`
2. **API Call** → `POST /api/dashboard/agent/test-calls` with sessionId and phoneNumber
3. **Twilio Integration** → Makes actual call to user's phone
4. **Voice Provider** → Connects AI agent to handle conversation
5. **Call Status** → Returns success/failure to frontend

## Next Steps

1. **Choose a voice provider** (Retell recommended for testing)
2. **Set up Twilio account** and get credentials
3. **Create `.env.local`** with API keys
4. **Update backend APIs** to use real services instead of mock data
5. **Test the call flow** end-to-end

## Cost Considerations

- **Twilio**: ~$0.01-0.02 per minute for calls
- **Retell**: Free tier available, then pay-per-minute
- **Vapi**: Free tier available, then pay-per-minute
- **Awaz**: Contact for pricing

## Support

If you need help with any of these integrations, I can help you:
- Set up the environment variables
- Update the backend APIs to use real services
- Test the call functionality
- Debug any issues
