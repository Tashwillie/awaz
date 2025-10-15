# Funnder Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended for Next.js)
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import from GitHub: `tash-growmodo-dev/Fuunder`
   - Select "Backend" as root directory

2. **Environment Variables**
   ```env
   NODE_ENV=production
   LOG_LEVEL=info
   DATABASE_URL=postgresql://user:pass@host:port/db
   GOOGLE_PLACES_API_KEY=your_key
   OPENAI_API_KEY=your_key
   VOICE_PROVIDER=retell
   RETELL_API_KEY=your_key
   VAPI_API_KEY=your_key
   AWAZ_API_KEY=your_key
   ```

3. **Database Setup**
   - Use Vercel Postgres or external provider (Neon, Supabase)
   - Run migrations: `pnpm db:push`

### Option 2: Railway
1. **Deploy**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Add PostgreSQL**
   ```bash
   railway add postgresql
   railway variables set DATABASE_URL=$DATABASE_URL
   ```

### Option 3: Docker + Cloud Provider
```bash
# Build and run locally first
docker build -t funnder-backend .
docker run -p 3000:3000 --env-file .env funnder-backend
```

## 🗄️ Database Setup

### PostgreSQL Providers
- **Neon** (Free tier): https://neon.tech
- **Supabase** (Free tier): https://supabase.com
- **Railway Postgres**: Built-in with Railway
- **Vercel Postgres**: Built-in with Vercel

### Database Migration
```bash
# After setting DATABASE_URL
pnpm db:push
pnpm db:seed
```

## 🔧 Environment Configuration

### Required Variables
```env
# Core
NODE_ENV=production
DATABASE_URL=postgresql://...

# APIs
GOOGLE_PLACES_API_KEY=AIza...
OPENAI_API_KEY=sk-proj-...

# Voice Providers (choose one)
VOICE_PROVIDER=retell|vapi|awaz
RETELL_API_KEY=...
VAPI_API_KEY=...
AWAZ_API_KEY=...

# Optional Integrations
HUBSPOT_API_KEY=...
GOOGLE_CALENDAR_CREDENTIALS_BASE64=...
SLACK_WEBHOOK_URL=...
```

### Frontend Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
```

## 🔄 CI/CD Setup

### GitHub Actions Workflow
The repository includes `.github/workflows/ci.yml` for:
- ✅ Type checking
- ✅ Linting
- ✅ Testing
- ✅ Build verification
- ✅ Database migration checks

### Manual Deployment Commands
```bash
# Install dependencies
pnpm install

# Type check
pnpm type-check

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🌐 Domain & SSL

### Custom Domain Setup
1. **Backend API**: `api.yourdomain.com`
2. **Frontend**: `yourdomain.com`
3. **Webhooks**: `api.yourdomain.com/api/voice/webhooks`

### SSL Certificates
- Vercel: Automatic SSL
- Railway: Automatic SSL
- Cloudflare: Free SSL proxy

## 📊 Monitoring & Logs

### Health Checks
- Backend: `GET /api/health`
- Database: Connection test in health endpoint
- External APIs: Timeout handling

### Logging
- Structured JSON logs in production
- Request correlation IDs
- PII redaction enabled

### Error Tracking
Consider adding:
- Sentry for error tracking
- DataDog for APM
- LogRocket for frontend monitoring

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API keys with minimal permissions
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Webhook signature verification
- [ ] PII redaction in logs

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/db
```

**API Keys Not Working**
```bash
# Verify environment variables
pnpm dev
# Check logs for missing keys
```

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

**Webhook Issues**
- Ensure webhook URL is publicly accessible
- Check signature verification
- Verify provider-specific webhook secrets

## 📈 Performance Optimization

### Backend
- Enable Next.js production optimizations
- Use connection pooling for database
- Implement caching for Places API calls
- Add request compression

### Frontend
- Enable Next.js Image optimization
- Use dynamic imports for heavy components
- Implement proper loading states
- Add error boundaries

## 🔄 Updates & Maintenance

### Regular Tasks
- Update dependencies monthly
- Rotate API keys quarterly
- Monitor error rates and performance
- Backup database regularly

### Scaling Considerations
- Use CDN for static assets
- Implement horizontal scaling
- Add Redis for session storage
- Consider microservices for high traffic

---

## 🆘 Support

For deployment issues:
1. Check logs in your hosting platform
2. Verify environment variables
3. Test locally with production config
4. Check GitHub Issues for known problems

**Happy Deploying! 🚀**
