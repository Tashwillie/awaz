# Funnder Frontend

A modern Next.js frontend for the Funnder AI voice demo platform, inspired by the Rosie interface design.

## Features

- 🎯 **5-Step Demo Flow**: Search → Select → Preview → Build → Active
- 🎨 **Modern UI**: Clean, purple-themed design with Tailwind CSS
- 📱 **Responsive**: Works on desktop and mobile
- 🔄 **Real-time Updates**: Live call status tracking
- 🎙️ **Voice Integration**: Ready for AWAZ/Vapi/Retell widgets
- 🛡️ **Type Safety**: Full TypeScript support
- 🧪 **Error Handling**: Comprehensive error states and loading

## Quick Start

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Copy environment variables
cp env.example .env.local

# Start development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) to see the demo page.

## Environment Variables

Create `.env.local` with:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Cloudflare Turnstile for bot protection
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

**Note**: Environment variables prefixed with `NEXT_PUBLIC_` are available on both server and client. All other variables are server-only.

## Demo Flow

### Step 1: Business Search
- Enter business name, city, country
- Optional Google Maps URL
- Searches via your backend's Google Places API

### Step 2: Business Selection
- Shows top 3 search results
- Displays business info: name, address, rating, types
- User selects correct business

### Step 3: Preview & Contact
- Shows AI agent preview with audio samples
- Collects visitor contact information
- Consent checkbox for demo call

### Step 4: Building Agent
- Shows training progress
- Real-time status updates
- Creates demo session and initiates call

### Step 5: Active Demo
- Live call status tracking
- Voice widget integration
- Call summary and transcript

## API Integration

The frontend connects to your existing backend APIs:

- `GET /api/places/search` - Business search
- `POST /api/demo/start` - Create demo session
- `POST /api/demo/confirm` - Build business profile
- `POST /api/demo/receive-call` - Initiate voice call
- `GET /api/demo/status/:id` - Get session status

## Voice Provider Setup

To enable voice calls, configure your backend:

1. **Set voice provider** in backend `.env`:
   ```env
   VOICE_PROVIDER=awaz  # or 'vapi', 'retell'
   AWAZ_API_KEY=your_awaz_api_key
   ```

2. **Implement AWAZ provider** in backend:
   - Create `src/services/providers/voice/awaz.ts`
   - Register in `src/services/providers/voice/register.ts`

3. **Add voice widget** to session page:
   - Replace placeholder with actual AWAZ widget iframe
   - Configure widget with call ID

## Customization

### Styling
- Modify `tailwind.config.js` for colors/themes
- Update `src/app/globals.css` for custom styles
- Purple theme can be changed to any color

### Components
- All components are in `src/components/`
- UI components in `src/components/ui/`
- Demo-specific components in `src/components/demo/`

### API Configuration
- Update `src/lib/api.ts` for API endpoints
- Modify types in `src/types/demo.ts`

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## Architecture

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── demo/           # Main demo flow
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── demo/          # Demo-specific components
│   ├── lib/               # Utilities and API client
│   └── types/             # TypeScript types
├── public/                # Static assets
└── package.json
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License

Private - Funnder Project
