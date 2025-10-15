# Vercel Deployment Guide

## Environment Variables Setup

To deploy successfully on Vercel, you need to set the following environment variables in your Vercel dashboard:

### Required Environment Variables

1. **DATABASE_URL** - Your production database connection string
   - Example: `postgresql://username:password@host:port/database`
   - For production, use a managed database service like:
     - Vercel Postgres
     - Supabase
     - PlanetScale
     - Neon
     - Railway

### Optional Environment Variables (Set as needed)

2. **TURNSTILE_SECRET** - Cloudflare Turnstile secret key
3. **GOOGLE_PLACES_API_KEY** - Google Places API key
4. **OPENAI_API_KEY** - OpenAI API key
5. **FIRECRAWL_API_KEY** - Firecrawl API key
6. **RETELL_API_KEY** - Retell AI API key
7. **RETELL_WEBHOOK_SECRET** - Retell webhook secret
8. **VAPI_API_KEY** - Vapi API key
9. **VAPI_WEBHOOK_SECRET** - Vapi webhook secret
10. **AWAZ_API_KEY** - Awaz API key
11. **HUBSPOT_API_KEY** - HubSpot API key
12. **PIPEDRIVE_API_TOKEN** - Pipedrive API token
13. **GOOGLE_CALENDAR_CREDENTIALS_BASE64** - Google Calendar credentials (base64 encoded)
14. **CALENDLY_TOKEN** - Calendly API token
15. **SLACK_WEBHOOK_URL** - Slack webhook URL
16. **DEMO_TTL_HOURS** - Demo session TTL (default: 24)

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with its value
5. Make sure to set the environment (Production, Preview, Development)

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add TURNSTILE_SECRET
# ... add other variables as needed

# Deploy
vercel --prod
```

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)
1. Go to Vercel dashboard
2. Click on "Storage" tab
3. Create a new Postgres database
4. Copy the connection string to `DATABASE_URL`

### Option 2: Supabase
1. Create account at supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string to `DATABASE_URL`

### Option 3: PlanetScale
1. Create account at planetscale.com
2. Create a new database
3. Get the connection string
4. Set as `DATABASE_URL`

## Deployment Steps

1. **Set up environment variables** (see above)
2. **Connect your GitHub repository** to Vercel
3. **Configure build settings**:
   - Build Command: `pnpm run build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
4. **Deploy**

## Post-Deployment Setup

After successful deployment:

1. **Run database migrations**:
   ```bash
   # Connect to your production database and run:
   npx prisma migrate deploy
   ```

2. **Seed the database** (if needed):
   ```bash
   npx prisma db seed
   ```

3. **Test the deployment**:
   - Visit your Vercel URL
   - Test API endpoints
   - Verify database connectivity

## Troubleshooting

### Common Issues

1. **Build fails with "DATABASE_URL required"**
   - Solution: Set `DATABASE_URL` in Vercel environment variables

2. **Database connection fails**
   - Check if your database allows connections from Vercel IPs
   - Verify the connection string format
   - Ensure database is running and accessible

3. **API routes return 500 errors**
   - Check Vercel function logs
   - Verify all required environment variables are set
   - Check database connectivity

4. **Build timeout**
   - Increase build timeout in vercel.json
   - Optimize build process
   - Remove unnecessary dependencies

### Monitoring

- Use Vercel's built-in monitoring
- Set up error tracking (Sentry, etc.)
- Monitor database performance
- Set up uptime monitoring

## Security Considerations

1. **Never commit environment variables** to Git
2. **Use different databases** for development and production
3. **Rotate API keys** regularly
4. **Use least privilege** for database access
5. **Enable SSL** for database connections
6. **Set up proper CORS** policies
7. **Use rate limiting** for API endpoints
8. **Implement proper authentication** for admin functions
