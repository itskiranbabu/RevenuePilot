# 🚀 RevenuePilot AI - Enterprise Marketing Platform

**AI-powered marketing content generation with 15+ specialized agents, multi-provider fallback, and advanced analytics.**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://revenue-pilot-two.vercel.app)
[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/itskiranbabu/RevenuePilot)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### 🤖 **15+ Specialized AI Agents**
- **Ads & Traffic**: Ad Copy, Ad Hooks, Audience Research
- **Content & Copy**: Headlines, Brand Voice
- **Strategy & Funnels**: Sales Pages, Funnel Builder, Offer Builder, Webinar Scripts
- **Communication**: Email Sequences, WhatsApp Scripts, CRM Follow-ups
- **Video & Creative**: Video Ad Scripts
- **Analytics**: A/B Testing & Performance Analysis

### 🔄 **Multi-Provider AI System (NEW!)**
- **Automatic Fallback** - Seamlessly switches between providers on errors
- **4 AI Providers** - Google Gemini, Groq, Together AI, Hugging Face
- **99.9% Uptime** - Never experience downtime with redundant providers
- **Smart Routing** - Automatically uses the fastest available provider
- **Real-Time Monitoring** - Check provider health in Settings

### ⚡ **Real-Time Features**
- **Streaming AI Responses** - Watch content generate word-by-word
- **Live Project Sync** - Changes appear instantly across tabs
- **Auto-Save** - Never lose your work
- **Smart Suggestions** - AI-powered improvement recommendations
- **Real-Time Analytics** - Live usage metrics and insights

### 🎨 **Modern UX**
- Dark/Light mode with smooth transitions
- Responsive design for all devices
- Beautiful glass-morphism effects
- Markdown rendering with syntax highlighting
- Toast notifications for user feedback

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- **At least ONE AI provider API key** (all have free tiers!)
- Supabase account ([Sign up](https://supabase.com))

### 1. Clone Repository
```bash
git clone https://github.com/itskiranbabu/RevenuePilot.git
cd RevenuePilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure AI Providers

**Choose your setup level:**

#### 🟢 **Minimum Setup** (Choose ONE)
Get started with just one provider:

**Option A: Google Gemini** (Recommended for beginners)
```bash
# Get key from: https://aistudio.google.com/app/apikey
VITE_API_KEY=your_gemini_api_key_here
```

**Option B: Groq** (Fastest, completely free)
```bash
# Get key from: https://console.groq.com/keys
VITE_GROQ_API_KEY=your_groq_api_key_here
```

#### 🟡 **Recommended Setup** (Best reliability)
Add 2 providers for automatic fallback:

```bash
# Primary provider
VITE_API_KEY=your_gemini_api_key_here

# Fallback provider (very fast, free)
VITE_GROQ_API_KEY=your_groq_api_key_here
```

#### 🟢 **Maximum Reliability** (Production-ready)
Add all 4 providers for 99.9% uptime:

```bash
# Primary
VITE_API_KEY=your_gemini_api_key_here

# Fallback 1 (fastest)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Fallback 2
VITE_TOGETHER_API_KEY=your_together_api_key_here

# Fallback 3
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### 4. Configure Supabase
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Create .env.local File
```bash
# Copy the template
cp .env .env.local

# Edit .env.local and add your keys
```

### 6. Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated results table
CREATE TABLE generated_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  inputs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for generated_results
CREATE POLICY "Users can view own results" ON generated_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own results" ON generated_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own results" ON generated_results
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_results_project_id ON generated_results(project_id);
CREATE INDEX idx_results_user_id ON generated_results(user_id);
CREATE INDEX idx_results_created_at ON generated_results(created_at DESC);
```

### 7. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 AI Provider Setup Guide

### 1. Google Gemini (Primary - Recommended)
- **Free Tier**: 60 requests/minute
- **Get API Key**: https://aistudio.google.com/app/apikey
- **Environment Variable**: `VITE_API_KEY`
- **Best For**: General use, reliable, fast

### 2. Groq (Fallback 1 - Highly Recommended)
- **Free Tier**: 30 requests/minute, unlimited
- **Get API Key**: https://console.groq.com/keys
- **Environment Variable**: `VITE_GROQ_API_KEY`
- **Best For**: Extremely fast inference, completely free

### 3. Together AI (Fallback 2 - Optional)
- **Free Tier**: $25 free credits
- **Get API Key**: https://api.together.xyz/settings/api-keys
- **Environment Variable**: `VITE_TOGETHER_API_KEY`
- **Best For**: Good quality, generous free tier

### 4. Hugging Face (Fallback 3 - Optional)
- **Free Tier**: Free inference API
- **Get API Key**: https://huggingface.co/settings/tokens
- **Environment Variable**: `VITE_HUGGINGFACE_API_KEY`
- **Best For**: Open-source models, free forever

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (if not already done)
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required (Supabase):**
| Variable | Value | Environments |
|----------|-------|--------------| 
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

**AI Providers (Add at least ONE):**
| Variable | Value | Environments |
|----------|-------|--------------| 
| `VITE_API_KEY` | Gemini API key | Production, Preview, Development |
| `VITE_GROQ_API_KEY` | Groq API key (optional) | Production, Preview, Development |
| `VITE_TOGETHER_API_KEY` | Together AI key (optional) | Production, Preview, Development |
| `VITE_HUGGINGFACE_API_KEY` | HF API key (optional) | Production, Preview, Development |

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live! 🎉

### Manual Build
```bash
npm run build
npm run preview
```

---

## 🏗️ Project Structure

```
RevenuePilot/
├── components/          # React components
│   ├── AgentCard.tsx
│   ├── AgentWorkspace.tsx
│   ├── ProjectView.tsx
│   ├── AnalyticsView.tsx
│   ├── SettingsView.tsx    # NEW: Provider status monitoring
│   └── ...
├── context/            # React context providers
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── lib/                # Utilities and clients
│   └── supabase.ts
├── services/           # API services
│   ├── geminiService.ts      # Unified AI service interface
│   └── aiProviders.ts        # NEW: Multi-provider system
├── constants.ts        # Agent configurations
├── types.ts           # TypeScript definitions
├── index.css          # Global styles with Tailwind
├── index.tsx          # App entry point
├── App.tsx            # Main app component
└── vite.config.ts     # Vite configuration
```

---

## 🔧 Configuration Files

### `tailwind.config.js`
Tailwind CSS configuration with custom colors and dark mode.

### `postcss.config.js`
PostCSS configuration for Tailwind processing.

### `vercel.json`
Vercel deployment configuration with routing and headers.

### `tsconfig.json`
TypeScript configuration for strict type checking.

---

## 🎯 Usage

### 1. **Check Provider Status**
Go to Settings → AI Provider Status to verify your providers are configured and healthy.

### 2. **Select an Agent**
Choose from 15+ specialized marketing agents on the dashboard.

### 3. **Configure Inputs**
Fill in the required fields (product name, audience, etc.).

### 4. **Generate Content**
Click "Generate Content" - the system automatically uses the best available provider.

### 5. **Automatic Fallback**
If one provider fails (503, 429 errors), the system automatically tries the next provider.

### 6. **Save to Project**
Auto-save or manually save to organize your content.

### 7. **Chain Workflows**
Use output from one agent as input for another.

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Where to Get | Required |
|----------|-------------|--------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API | ✅ Yes |

### AI Provider Variables (At least ONE required)

| Variable | Description | Where to Get | Free Tier |
|----------|-------------|--------------|-----------|
| `VITE_API_KEY` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ 60 req/min |
| `VITE_GROQ_API_KEY` | Groq API key | [Groq Console](https://console.groq.com/keys) | ✅ 30 req/min |
| `VITE_TOGETHER_API_KEY` | Together AI API key | [Together AI](https://api.together.xyz/settings/api-keys) | ✅ $25 credits |
| `VITE_HUGGINGFACE_API_KEY` | Hugging Face token | [HF Settings](https://huggingface.co/settings/tokens) | ✅ Free |

### Local Development
Create `.env.local` file in root directory:
```env
# Supabase (Required)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here

# AI Providers (Add at least one)
VITE_API_KEY=your_gemini_key_here
VITE_GROQ_API_KEY=your_groq_key_here
```

### Production (Vercel)
Add variables in Vercel Dashboard → Settings → Environment Variables.

**Important**: Use `VITE_` prefix for all variables (Vite requirement).

---

## 🐛 Troubleshooting

### "No AI providers configured" Error
**Solution**: Add at least one AI provider API key
- ✅ Add `VITE_API_KEY` (Gemini) OR `VITE_GROQ_API_KEY` (Groq)
- ✅ Verify variable name has `VITE_` prefix
- ✅ Redeploy after adding variables
- ✅ Check Settings → AI Provider Status

### "503 Service Overloaded" or "429 Rate Limit" Errors
**Solution**: The multi-provider system handles this automatically!
- ✅ Add multiple providers for automatic fallback
- ✅ System will try Groq if Gemini is overloaded
- ✅ Check Settings → AI Provider Status to see which providers are healthy
- ✅ Recommended: Add at least 2 providers (Gemini + Groq)

### "All AI providers failed" Error
**Solution**: Check provider health
- ✅ Go to Settings → AI Provider Status
- ✅ Click "Refresh" to check provider health
- ✅ Verify API keys are correct
- ✅ Check if you have internet connection
- ✅ Try adding additional providers

### Tailwind Styles Not Working
- ✅ Ensure `tailwind.config.js` exists
- ✅ Ensure `postcss.config.js` exists
- ✅ Check `index.css` is imported in `index.tsx`
- ✅ Run `npm run build` to rebuild

### Supabase Connection Failed
- ✅ Verify URL format: `https://xxx.supabase.co`
- ✅ Use **anon/public** key, not service key
- ✅ Check RLS policies are created
- ✅ Verify tables exist in database

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

---

## 📊 Provider Status Monitoring

### Check Provider Health
1. Go to **Settings** in the app
2. View **AI Provider Status** section
3. See which providers are:
   - ✅ **Healthy** (green) - Working perfectly
   - ⚠️ **Unhealthy** (amber) - Experiencing issues
   - ⭕ **Not Configured** (gray) - API key not added

### Add More Providers
1. Click "Get Key" next to any provider
2. Sign up and get your free API key
3. Add to Vercel environment variables
4. Redeploy your app
5. Click "Refresh" in Settings to verify

---

## 🚀 Performance Tips

### For Best Performance:
1. **Add Groq** - Fastest inference speed
2. **Add Gemini** - Most reliable, good quality
3. **Add Together AI** - Good balance of speed and quality
4. **Add Hugging Face** - Free forever, good for backup

### Recommended Combinations:

**Budget (Free Forever):**
- Groq + Hugging Face

**Balanced (Best Value):**
- Gemini + Groq

**Maximum Reliability (Production):**
- Gemini + Groq + Together AI + Hugging Face

---

## 📚 Documentation

- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Complete feature overview
- **[FIXES_STATUS_REPORT.md](./FIXES_STATUS_REPORT.md)** - Recent fixes and changes
- **[Issue #3](https://github.com/itskiranbabu/RevenuePilot/issues/3)** - Environment variables fix

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - AI content generation
- **Groq** - Ultra-fast inference
- **Together AI** - Quality AI models
- **Hugging Face** - Open-source AI models
- **Supabase** - Backend and real-time database
- **Vercel** - Hosting and deployment
- **Tailwind CSS** - Styling framework
- **Lucide Icons** - Beautiful icons

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/itskiranbabu/RevenuePilot/issues)
- **Documentation**: [Docs](./DEPLOYMENT_STATUS.md)
- **Email**: support@revenuepilot.ai

---

**Built with ❤️ by the RevenuePilot Team**

⭐ Star this repo if you find it helpful!
