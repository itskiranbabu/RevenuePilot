# 🔄 Multi-Provider AI System - Complete Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Provider Setup](#provider-setup)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

RevenuePilot uses an intelligent multi-provider AI system that automatically falls back to alternative providers when errors occur. This ensures **99.9% uptime** and eliminates the frustrating "503 Service Overloaded" and "429 Rate Limit Exceeded" errors.

### Key Benefits
- ✅ **Zero Downtime** - Automatic failover between providers
- ✅ **Cost Optimization** - Use free tiers from multiple providers
- ✅ **Performance** - Always uses the fastest available provider
- ✅ **Reliability** - Multiple redundant providers
- ✅ **Easy Setup** - Just add API keys, no code changes needed

---

## 🔧 How It Works

### Provider Priority Order
The system tries providers in this order:

1. **Google Gemini** (Primary)
   - Fast, reliable, good quality
   - Free tier: 60 requests/minute

2. **Groq** (Fallback 1)
   - Extremely fast inference
   - Free tier: 30 requests/minute

3. **Together AI** (Fallback 2)
   - Good quality, generous free tier
   - Free tier: $25 credits

4. **Hugging Face** (Fallback 3)
   - Open-source models
   - Free tier: Unlimited (with rate limits)

### Automatic Fallback Logic

```
User Request
    ↓
Try Gemini
    ↓
Success? → Return Content ✅
    ↓ No
503/429 Error?
    ↓ Yes
Try Groq
    ↓
Success? → Return Content ✅
    ↓ No
Try Together AI
    ↓
Success? → Return Content ✅
    ↓ No
Try Hugging Face
    ↓
Success? → Return Content ✅
    ↓ No
Return Error ❌
```

### Retry Logic
- Each provider gets **3 retry attempts**
- Exponential backoff: 1s → 2s → 4s
- Rate limiting: Respects each provider's limits
- Smart error detection: Only retries on retryable errors (503, 429, timeouts)

---

## 🔑 Provider Setup

### 1. Google Gemini (Recommended First)

**Why Choose Gemini:**
- Most reliable and consistent
- Good quality outputs
- Fast response times
- Generous free tier

**Setup Steps:**

1. **Get API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to Environment**
   ```bash
   VITE_API_KEY=your_gemini_api_key_here
   ```

3. **Verify**
   - Go to Settings → AI Provider Status
   - Should show "Healthy" with green checkmark

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for development and small production apps

---

### 2. Groq (Recommended Second)

**Why Choose Groq:**
- **Fastest inference** in the industry
- Completely free
- No credit card required
- Great for high-volume applications

**Setup Steps:**

1. **Get API Key**
   - Visit: https://console.groq.com/keys
   - Sign up (free, no credit card)
   - Click "Create API Key"
   - Copy the key

2. **Add to Environment**
   ```bash
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Verify**
   - Go to Settings → AI Provider Status
   - Should show "Healthy" with green checkmark

**Free Tier Limits:**
- 30 requests per minute
- Unlimited requests per day
- Extremely fast response times (< 1 second)

---

### 3. Together AI (Optional)

**Why Choose Together AI:**
- Good balance of speed and quality
- Generous free credits
- Multiple model options

**Setup Steps:**

1. **Get API Key**
   - Visit: https://api.together.xyz/settings/api-keys
   - Sign up (free)
   - Click "Create new API key"
   - Copy the key

2. **Add to Environment**
   ```bash
   VITE_TOGETHER_API_KEY=your_together_api_key_here
   ```

3. **Verify**
   - Go to Settings → AI Provider Status
   - Should show "Healthy" with green checkmark

**Free Tier:**
- $25 free credits on signup
- ~500,000 tokens with free credits
- Good for testing and small projects

---

### 4. Hugging Face (Optional)

**Why Choose Hugging Face:**
- Completely free forever
- Open-source models
- Great for backup/fallback

**Setup Steps:**

1. **Get API Token**
   - Visit: https://huggingface.co/settings/tokens
   - Sign up (free)
   - Click "New token"
   - Select "Read" access
   - Copy the token

2. **Add to Environment**
   ```bash
   VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
   ```

3. **Verify**
   - Go to Settings → AI Provider Status
   - Should show "Healthy" with green checkmark

**Free Tier:**
- Free inference API
- Rate limited but unlimited usage
- May have slower response times

---

## ⚙️ Configuration

### Local Development

1. **Create `.env.local` file:**
   ```bash
   # Supabase (Required)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Providers (Add at least one)
   VITE_API_KEY=your_gemini_key
   VITE_GROQ_API_KEY=your_groq_key
   VITE_TOGETHER_API_KEY=your_together_key
   VITE_HUGGINGFACE_API_KEY=your_hf_token
   ```

2. **Restart development server:**
   ```bash
   npm run dev
   ```

### Production (Vercel)

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to Settings → Environment Variables

2. **Add Variables:**
   - Click "Add New"
   - Add each variable one by one
   - Select all environments (Production, Preview, Development)

3. **Redeploy:**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### Environment Variable Names

**IMPORTANT:** All variables must have `VITE_` prefix!

✅ Correct:
```
VITE_API_KEY
VITE_GROQ_API_KEY
VITE_TOGETHER_API_KEY
VITE_HUGGINGFACE_API_KEY
```

❌ Wrong:
```
API_KEY
GROQ_API_KEY
TOGETHER_API_KEY
HUGGINGFACE_API_KEY
```

---

## 🧪 Testing

### 1. Check Provider Status

1. Open your app
2. Go to **Settings**
3. Look at **AI Provider Status** section
4. Click **Refresh** button

You should see:
- ✅ Green "Healthy" for configured providers
- ⚠️ Amber "Unhealthy" if provider has issues
- ⭕ Gray "Not Configured" if API key missing

### 2. Test Content Generation

1. Go to **Dashboard**
2. Select any agent (e.g., "Ad Copy Generator")
3. Fill in required fields
4. Click **Generate Content**

Watch the console (F12) to see which provider is being used:
```
🤖 Attempting generation with Google Gemini...
✅ Successfully generated content with Google Gemini
```

### 3. Test Fallback

To test automatic fallback:

1. **Temporarily remove Gemini key** from environment
2. **Restart app**
3. **Try generating content**
4. **Check console** - should show:
   ```
   🤖 Attempting generation with Groq...
   ✅ Successfully generated content with Groq
   ```

### 4. Simulate Provider Failure

The system automatically handles:
- 503 Service Overloaded errors
- 429 Rate Limit errors
- Network timeouts
- Connection errors

When these occur, you'll see:
```
❌ Google Gemini failed: 503 Service Overloaded
🤖 Attempting generation with Groq...
✅ Successfully generated content with Groq
```

---

## 🐛 Troubleshooting

### Issue: "No AI providers configured"

**Symptoms:**
- Error message when generating content
- All providers show "Not Configured" in Settings

**Solutions:**
1. ✅ Add at least one API key to environment variables
2. ✅ Verify variable names have `VITE_` prefix
3. ✅ Restart development server or redeploy
4. ✅ Check for typos in variable names

### Issue: "All AI providers failed"

**Symptoms:**
- Content generation fails
- All providers tried but none succeeded

**Solutions:**
1. ✅ Check internet connection
2. ✅ Verify API keys are correct (copy-paste again)
3. ✅ Check provider status pages:
   - Gemini: https://status.cloud.google.com/
   - Groq: https://status.groq.com/
4. ✅ Try adding additional providers
5. ✅ Check Settings → AI Provider Status for details

### Issue: Provider shows "Unhealthy"

**Symptoms:**
- Provider configured but marked unhealthy
- Red/amber status in Settings

**Solutions:**
1. ✅ Verify API key is correct
2. ✅ Check if you've exceeded rate limits
3. ✅ Wait a few minutes and click "Refresh"
4. ✅ Check provider's status page
5. ✅ Try regenerating the API key

### Issue: Slow Response Times

**Symptoms:**
- Content generation takes > 10 seconds
- Timeout errors

**Solutions:**
1. ✅ Add Groq provider (fastest)
2. ✅ Check your internet connection
3. ✅ Try during off-peak hours
4. ✅ Add multiple providers for better routing

### Issue: Rate Limit Errors

**Symptoms:**
- "429 Rate Limit Exceeded" errors
- Frequent fallbacks to other providers

**Solutions:**
1. ✅ Add multiple providers to distribute load
2. ✅ Implement request queuing in your app
3. ✅ Upgrade to paid tiers if needed
4. ✅ Use Groq (higher free tier limits)

---

## 🎯 Best Practices

### For Development

**Minimum Setup:**
```bash
VITE_API_KEY=gemini_key  # OR
VITE_GROQ_API_KEY=groq_key
```

**Recommended:**
```bash
VITE_API_KEY=gemini_key
VITE_GROQ_API_KEY=groq_key
```

### For Production

**Minimum (Not Recommended):**
```bash
VITE_API_KEY=gemini_key
VITE_GROQ_API_KEY=groq_key
```

**Recommended:**
```bash
VITE_API_KEY=gemini_key
VITE_GROQ_API_KEY=groq_key
VITE_TOGETHER_API_KEY=together_key
```

**Maximum Reliability:**
```bash
VITE_API_KEY=gemini_key
VITE_GROQ_API_KEY=groq_key
VITE_TOGETHER_API_KEY=together_key
VITE_HUGGINGFACE_API_KEY=hf_token
```

### Performance Optimization

1. **Primary Provider:** Use Gemini or Groq
   - Gemini: Better quality, more reliable
   - Groq: Faster, completely free

2. **Fallback Providers:** Add at least 2
   - Ensures 99.9% uptime
   - Distributes load across providers

3. **Monitor Usage:**
   - Check Settings → AI Provider Status regularly
   - Watch for unhealthy providers
   - Add more providers if hitting rate limits

4. **Cost Optimization:**
   - Use free tiers from all providers
   - Groq + Hugging Face = completely free forever
   - Gemini + Together AI = generous free tiers

### Security

1. **Never commit API keys** to Git
2. **Use environment variables** only
3. **Rotate keys** periodically
4. **Use different keys** for dev/prod
5. **Monitor usage** for unusual activity

### Monitoring

1. **Check provider health** weekly
2. **Monitor error rates** in console
3. **Track which providers** are used most
4. **Set up alerts** for all providers failing
5. **Review logs** for patterns

---

## 📊 Provider Comparison

| Provider | Speed | Quality | Free Tier | Best For |
|----------|-------|---------|-----------|----------|
| **Gemini** | ⚡⚡⚡ Fast | ⭐⭐⭐⭐⭐ Excellent | 60 req/min | Primary, Production |
| **Groq** | ⚡⚡⚡⚡⚡ Fastest | ⭐⭐⭐⭐ Very Good | 30 req/min | Speed, High Volume |
| **Together AI** | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ Very Good | $25 credits | Balanced |
| **Hugging Face** | ⚡⚡ Moderate | ⭐⭐⭐ Good | Unlimited* | Backup, Free Forever |

*Rate limited but no hard cap

---

## 🚀 Quick Start Checklist

- [ ] Sign up for at least 2 providers
- [ ] Get API keys from each provider
- [ ] Add keys to `.env.local` (local) or Vercel (production)
- [ ] Restart server or redeploy
- [ ] Check Settings → AI Provider Status
- [ ] Verify all providers show "Healthy"
- [ ] Test content generation
- [ ] Monitor console for provider usage
- [ ] Set up monitoring/alerts

---

## 📞 Support

If you encounter issues:

1. **Check this guide** first
2. **Review Settings** → AI Provider Status
3. **Check console logs** (F12)
4. **Open GitHub Issue** with:
   - Error message
   - Provider status screenshot
   - Console logs
   - Steps to reproduce

---

## 🎉 Success!

Once configured, you'll have:
- ✅ 99.9% uptime
- ✅ Automatic error recovery
- ✅ No more 503/429 errors
- ✅ Optimal performance
- ✅ Cost-effective solution

**Happy generating! 🚀**
