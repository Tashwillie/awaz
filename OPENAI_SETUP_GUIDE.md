# OpenAI API Setup Guide

To use the AI voice functionality, you need to set up your OpenAI API key.

## 🔑 Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the generated API key

## 📁 Setting Up Environment Variables

### Option 1: Create .env file (Recommended)

Create a `.env` file in the root directory with:

```env
NODE_ENV=development
LOG_LEVEL=info
OPENAI_API_KEY=your_actual_openai_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/funnder_dev
```

### Option 2: Set Environment Variable Directly

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your_actual_openai_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your_actual_openai_api_key_here
```

**macOS/Linux:**
```bash
export OPENAI_API_KEY="your_actual_openai_api_key_here"
```

## 🚀 Testing the Setup

1. **Restart the backend server** after setting the API key:
   ```bash
   npm run dev
   ```

2. **Test the API endpoint**:
   ```bash
   curl -X GET http://localhost:3001/api/generate-voice
   ```

3. **Test voice generation**:
   ```bash
   curl -X POST http://localhost:3001/api/generate-voice \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello, this is a test","voiceType":"greeting","businessName":"Test Business"}'
   ```

## 🔧 Troubleshooting

### Error: "OpenAI API key not configured"

- ✅ Check that `.env` file exists in root directory
- ✅ Verify `OPENAI_API_KEY` is set correctly
- ✅ Restart the backend server after adding the key
- ✅ Ensure the API key is valid and has credits

### Error: "Failed to generate voice"

- ✅ Check OpenAI API key is valid
- ✅ Verify you have OpenAI credits/billing set up
- ✅ Check network connectivity
- ✅ Look at backend console for detailed error messages

### Error: "Audio playback failed"

- ✅ Check browser audio permissions
- ✅ Verify audio format support (MP3)
- ✅ Check network connectivity
- ✅ Try different browser or incognito mode

## 💰 OpenAI Pricing

Voice generation uses OpenAI's TTS (Text-to-Speech) API:
- **Cost**: ~$0.015 per 1K characters
- **Free Tier**: $5 credit for new accounts
- **Usage**: Each voice sample is typically 50-100 characters

## 🎯 Voice Options

The system supports 6 different voices:
- **alloy**: Neutral, balanced voice
- **echo**: Clear, professional voice  
- **fable**: Warm, friendly voice
- **onyx**: Deep, authoritative voice
- **nova**: Bright, energetic voice (default)
- **shimmer**: Smooth, pleasant voice

## 📞 Support

If you continue to have issues:
1. Check the browser console for error messages
2. Check the backend console for API errors
3. Verify your OpenAI account has sufficient credits
4. Test with a simple text sample first
