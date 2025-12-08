# 🚀 RevenuePilot AI - Enterprise Marketing Platform

**AI-powered marketing content generation with 15+ specialized agents, real-time streaming, and advanced analytics.**

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
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
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

### 3. Configure Environment Variables
```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local and add your keys:
VITE_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Set Up Supabase Database

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
CREATE TABLE user_profiles (
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
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_results_project_id ON generated_results(project_id);
CREATE INDEX idx_results_user_id ON generated_results(user_id);
CREATE INDEX idx_results_created_at ON generated_results(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE generated_results;
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

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

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_API_KEY` | Your Gemini API key | Production, Preview, Development |
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

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
│   ├── AgentWorkspaceV2.tsx  # Enhanced with streaming
│   ├── ProjectView.tsx       # Real-time subscriptions
│   ├── AnalyticsView.tsx     # Live analytics
│   └── ...
├── context/            # React context providers
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── lib/                # Utilities and clients
│   └── supabase.ts
├── services/           # API services
│   └── geminiService.ts      # AI service with streaming
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

### 1. **Select an Agent**
Choose from 15+ specialized marketing agents on the dashboard.

### 2. **Configure Inputs**
Fill in the required fields (product name, audience, etc.).

### 3. **Generate Content**
Click "Generate Content" and watch AI create in real-time.

### 4. **Save to Project**
Auto-save or manually save to organize your content.

### 5. **Get Suggestions**
Click "Get AI Suggestions" for improvement recommendations.

### 6. **Chain Workflows**
Use output from one agent as input for another.

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_API_KEY` | Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |

### Local Development
Create `.env.local` file in root directory:
```env
VITE_API_KEY=your_key_here
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Production (Vercel)
Add variables in Vercel Dashboard → Settings → Environment Variables.

**Important**: Use `VITE_` prefix for all variables (Vite requirement).

---

## 🐛 Troubleshooting

### "API Key is missing" Error
- ✅ Check variable name is exactly `VITE_API_KEY` (case-sensitive)
- ✅ Verify you redeployed after adding variables
- ✅ Clear browser cache (Ctrl+Shift+R)

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

## 📚 Documentation

- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Complete feature overview
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Recent fixes and changes
- **[VERCEL_FIX.md](./VERCEL_FIX.md)** - Quick Vercel setup guide
- **[Issue #1](https://github.com/itskiranbabu/RevenuePilot/issues/1)** - Deployment checklist
- **[Issue #2](https://github.com/itskiranbabu/RevenuePilot/issues/2)** - Real-time features
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
