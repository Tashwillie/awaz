# PowerShell script to create .env.local file for OpenAI API setup

Write-Host "Setting up .env.local file for Funnder..." -ForegroundColor Green

# Create .env.local file content
$envContent = @"
NODE_ENV=development
LOG_LEVEL=info
TURNSTILE_SECRET=

GOOGLE_PLACES_API_KEY=
OPENAI_API_KEY=your_openai_api_key_here

VOICE_PROVIDER=retell
RETELL_API_KEY=
VAPI_API_KEY=
AWAZ_API_KEY=

CRM=hubspot
HUBSPOT_API_KEY=
PIPEDRIVE_API_TOKEN=

CALENDAR=google
GOOGLE_CALENDAR_CREDENTIALS_BASE64=
CALENDLY_TOKEN=

SLACK_WEBHOOK_URL=  
DEMO_TTL_HOURS=24

DATABASE_URL=postgresql://username:password@localhost:5432/funnder_dev
"@

# Write to .env.local file
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "Created .env.local file" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Get your OpenAI API key from: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "2. Replace your_openai_api_key_here in .env.local with your actual API key" -ForegroundColor White
Write-Host "3. Restart the backend server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Important: Never commit .env.local to git!" -ForegroundColor Red
