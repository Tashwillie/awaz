# Funnder Backend (Next.js / TypeScript)

Lean, backend-first **Next.js** app that powers the on-site **"Receive a call"** demo and processes voice provider webhooks.

## Quick Start

```bash
pnpm install
cp env.example .env  # fill in your API keys
pnpm db:push         # setup database
pnpm dev
```

- API lives under `app/api/*` (App Router)
- Health: `GET /api/health`

## Smoke Tests

### Phase 1: Environment & Health

**Goal**: Ensure the app boots with validated env, health route works, logging/redaction confirmed.

**Acceptance Criteria**:
- `GET /api/health` returns `{ ok: true, version }` with 200
- Missing required envs → startup fails with clear message
- Logs redact phone/email if present in queries

**How to Test**:

1. **Basic Health Check**:
   ```bash
   pnpm dev
   # Visit http://localhost:3000/api/health
   # Expected: { "ok": true, "version": "0.1.0", "timestamp": "...", "requestId": "..." }
   ```

2. **Environment Validation**:
   ```bash
   # Remove DATABASE_URL from .env
   pnpm dev
   # Expected: Fatal startup error with clear message
   ```

3. **Optional Environment Warning**:
   ```bash
   # Remove TURNSTILE_SECRET from .env (keep DATABASE_URL)
   pnpm dev
   # Expected: Warning logged: "TURNSTILE_SECRET not set - Turnstile verification will be disabled in development"
   ```

4. **Run Tests**:
   ```bash
   pnpm test test/health.test.ts
   # Expected: All health endpoint tests pass
   ```

5. **Automated Smoke Test**:
   ```bash
   pnpm test:smoke
   # Expected: All automated smoke tests pass
   ```

**Manual Verification**:
- Check browser console/network tab for health endpoint response
- Verify logs show request correlation IDs
- Confirm PII redaction in logs (phone numbers, emails)

### Phase 2: Google Places Integration

**Goal**: Wire real Text Search + Place Details with input validation & timeouts.

**Acceptance Criteria**:
- `GET /api/places/search?q=&city=&country=` returns up to 3 candidates in < 2s
- Each candidate includes: place_id, name, address, website?, phone?, types[], rating?, user_ratings_total?, geo
- If Google quota/timeout → 502 with safe error body

**How to Test**:

1. **Set Google Places API Key**:
   ```bash
   # Add to .env file
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```

2. **Test Places Search**:
   ```bash
   curl "http://localhost:3000/api/places/search?q=Acme&city=Springfield&country=USA"
   # Expected: Array of up to 3 place results with all required fields
   ```

3. **Test Input Validation**:
   ```bash
   curl "http://localhost:3000/api/places/search?q="
   # Expected: 400 error with validation details
   
   curl "http://localhost:3000/api/places/search?q=$(printf 'a%.0s' {1..101})"
   # Expected: 400 error for query too long
   ```

4. **Test Error Handling**:
   ```bash
   # Remove GOOGLE_PLACES_API_KEY from .env
   curl "http://localhost:3000/api/places/search?q=test"
   # Expected: 500 error with safe message
   ```

5. **Run Tests**:
   ```bash
   pnpm test test/places.service.test.ts test/places.api.test.ts
   # Expected: All tests pass (except constructor test due to env caching)
   ```

**Features Implemented**:
- ✅ Real Google Places API integration with 1500ms timeout
- ✅ Retry logic (2 retries) for 429/5xx errors and network issues
- ✅ Comprehensive input validation with Zod
- ✅ Proper error handling with safe error messages
- ✅ Request correlation IDs and structured logging
- ✅ Unit tests covering happy path, timeouts, and quota exceeded scenarios

### Phase 3: Profile Builder (LLM + Deterministic Fallback)

**Goal**: Build business_profile_json from Places (+ optional website excerpt), with a non-LLM fallback so tests pass without keys.

**Acceptance Criteria**:
- `POST /api/demo/confirm` accepts `{ sessionId, placeId, websiteExcerpt?, edits?, faqs? }` and returns `{ business_profile_json }`
- If `OPENAI_API_KEY` missing, return a deterministic template using Places fields (no hallucinations)
- All outputs conform to `BusinessProfileJson` zod schema

**How to Test**:

1. **Without OPENAI_API_KEY (deterministic profile)**:
   ```bash
   # Ensure OPENAI_API_KEY is not set in .env
   curl -X POST http://localhost:3000/api/demo/confirm \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "test123", "placeId": "ChIJABC123", "phoneE164": "+1234567890"}'
   # Expected: Business profile with deterministic content (no hallucinations)
   ```

2. **With OPENAI_API_KEY (LLM profile)**:
   ```bash
   # Set OPENAI_API_KEY=sk-test in .env
   curl -X POST http://localhost:3000/api/demo/confirm \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "test123", "placeId": "ChIJABC123", "websiteExcerpt": "24/7 emergency services", "phoneE164": "+1234567890"}'
   # Expected: Business profile with LLM-generated content
   ```

3. **Input Validation**:
   ```bash
   curl -X POST http://localhost:3000/api/demo/confirm \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "test123", "placeId": "ChIJABC123"}'
   # Expected: 400 error - phoneE164: Required
   ```

4. **Schema Validation**:
   ```bash
   pnpm test test/profile-builder.test.ts test/demo-confirm.test.ts
   # Expected: All tests pass, including fallback path and LLM path (mocked)
   ```

**Features Implemented**:
- Profile builder service with deterministic fallback
- OpenAI integration with error handling and fallback
- Input validation for sessionId, placeId, websiteExcerpt, edits, faqs
- Business context storage and lead capture
- Comprehensive test coverage

### Phase 4: Voice Provider v1 (Retell Integration)

**Goal**: Trigger a phone callback ("Receive a call") and process provider webhooks into our DB.

**Acceptance Criteria**:
- `POST /api/demo/receive-call` with `{ sessionId, phone_e164 }` creates a call row and returns `{ callId }`
- `POST /api/voice/webhooks` upserts events idempotently; final event sets `call.status=COMPLETED` and stores summary/transcriptUrl
- Signature verification is plumbed (toggle test mode to bypass)

**How to Test**:

1. **Set Voice Provider**:
   ```bash
   # In .env file
   VOICE_PROVIDER=retell
   RETELL_API_KEY=your-key-here  # Optional for dev/test mode
   ```

2. **Trigger Voice Call**:
   ```bash
   curl -X POST http://localhost:3000/api/demo/receive-call \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "session-123", "phone_e164": "+1234567890"}'
   # Expected: 200 response with callId
   ```

3. **Mock Webhook Event**:
   ```bash
   curl -X POST http://localhost:3000/api/voice/webhooks \
     -H "Content-Type: application/json" \
     -H "X-Retell-Signature: test-signature" \
     -d '{
       "call_id": "retell-call-123",
       "event": "call_ended",
       "timestamp": 1234567890,
       "end_state": "ended_by_user",
       "transcript": "Customer called about services",
       "recording_url": "https://retell.ai/recording.mp3"
     }'
   # Expected: 200 response, call status updated to COMPLETED
   ```

4. **Test Idempotency**:
   ```bash
   # Send same webhook twice - should not duplicate records
   # Expected: Second request succeeds without creating duplicates
   ```

5. **Schema Validation**:
   ```bash
   pnpm test test/voice-providers.test.ts test/receive-call.test.ts test/webhooks.test.ts
   # Expected: All tests pass, including fallback path and webhook processing
   ```

**Features Implemented**:
- Retell provider with mock/dev mode support
- Voice call initiation with business context injection
- Webhook signature verification (bypassed in test/debug mode)
- Idempotent webhook processing with deduplication
- Call status transitions and completion handling
- Comprehensive test coverage

### Phase 5: Enhanced Business Intelligence (Firecrawl + Vapi)

**Goal**: Enhance business profile building with website content extraction and add Vapi as alternative voice provider.

**Acceptance Criteria**:
- `POST /api/demo/confirm` with `useFirecrawl: true` extracts website content to enhance business profiles
- Vapi provider available as alternative to Retell with `VOICE_PROVIDER=vapi`
- Enhanced profiles include real services, pricing, testimonials, and business hours from websites
- Graceful fallback when Firecrawl fails or is unavailable

**How to Test**:

1. **Set Enhanced Environment**:
   ```bash
   # In .env file
   FIRECRAWL_API_KEY=fc-1afa151b074243d98b5d7514f29ac0cb
   VAPI_API_KEY=79b29919-68b9-411d-a6d8-2a461e60bb81
   VOICE_PROVIDER=vapi  # Optional: test Vapi instead of Retell
   ```

2. **Test Enhanced Profile Building**:
   ```bash
   curl -X POST http://localhost:3000/api/demo/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "session-123",
       "placeId": "ChIJ...",
       "useFirecrawl": true,
       "name": "John Doe",
       "phoneE164": "+1234567890",
       "consent": true
     }'
   # Expected: Enhanced profile with website-extracted data
   ```

3. **Test Vapi Voice Provider**:
   ```bash
   # Set VOICE_PROVIDER=vapi in .env
   curl -X POST http://localhost:3000/api/demo/receive-call \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "session-123", "phone_e164": "+1234567890"}'
   # Expected: Vapi call initiated with enhanced business context
   ```

4. **Test Firecrawl Integration**:
   ```bash
   pnpm test test/firecrawl-integration.test.ts
   # Expected: All Firecrawl and Vapi tests pass
   ```

**Features Implemented**:
- Firecrawl service for website content extraction
- Enhanced profile builder with real business data
- Vapi provider implementation with webhook support
- Intelligent content parsing (services, pricing, testimonials, hours)
- Graceful fallback when external services fail
- Comprehensive test coverage for new integrations

## Environment Variables

Copy `env.example` to `.env` and configure:

- **Required**: `DATABASE_URL`, `VOICE_PROVIDER`
- **Optional**: Provider API keys, CRM/Calendar integrations

## API Endpoints

- `GET  /api/health` — healthcheck
- `GET  /api/places/search?q=&city=&country=` — Google Places search
- `POST /api/demo/start` — create demo session
- `POST /api/demo/confirm` — finalize business profile
- `POST /api/demo/receive-call` — trigger voice call
- `POST /api/voice/webhooks` — provider webhooks

## Voice Providers

Select via `VOICE_PROVIDER`: `retell | vapi | awaz`

Each provider implements the `VoiceProvider` interface with:
- `startCall()` — initiate outbound call
- `verifyWebhook()` — validate webhook signatures
- `parseEvent()` — normalize provider events

## Database

Uses Prisma with PostgreSQL. Schema includes:
- `DemoSession` — demo lifecycle
- `BusinessContext` — Google Places data
- `BusinessProfile` — AI agent context
- `Call` — voice call tracking
- `WebhookEvent` — provider events

## Testing

```bash
pnpm test              # run tests
pnpm test:watch        # watch mode
```

## Development

```bash
pnpm dev               # start dev server
pnpm build             # build for production
pnpm lint              # check code style
pnpm format            # format code
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Run database migrations: `pnpm db:migrate`
4. Deploy to your platform (Vercel, Railway, etc.)

## Architecture

- **API Routes**: Thin handlers in `app/api/*`
- **Services**: Business logic in `src/services/*`
- **Providers**: Voice provider adapters
- **Types**: Zod schemas for validation
- **Jobs**: TTL expiry via cron

## Security

- Turnstile verification on `/api/demo/receive-call`
- Rate limiting by IP
- Webhook signature verification
- PII redaction in logs
- Server-only secrets
#   F u n n d e r  
 