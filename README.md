<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RevenuePilot AI - Enterprise Marketing Automation

RevenuePilot is a comprehensive AI-powered SaaS platform featuring 15+ specialized marketing agents for ads, content creation, strategy, communication, video production, and analytics.

## 🚀 Features

- **15+ AI Agents**: Specialized agents for different marketing tasks
- **Real-time Collaboration**: Work with your team seamlessly
- **Dark/Light Mode**: Beautiful UI with theme switching
- **Supabase Integration**: Secure authentication and data storage
- **Gemini AI**: Powered by Google's advanced AI models
- **Project Management**: Organize and track all your marketing content

## 📋 Prerequisites

- Node.js 18+ 
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))
- Supabase Account ([Sign up](https://supabase.com))

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/itskiranbabu/RevenuePilot.git
   cd RevenuePilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🌐 Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/itskiranbabu/RevenuePilot)

### Manual Deployment

1. **Push to GitHub** (already done ✅)

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   
   Add these in Vercel → Settings → Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url (optional, currently hardcoded)
   SUPABASE_ANON_KEY=your_supabase_anon_key (optional, currently hardcoded)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live! 🎉

## 🗄️ Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Results Table
CREATE TABLE generated_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  inputs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own results" ON generated_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own results" ON generated_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
```

## 🎯 Available Agents

### Ads & Traffic
- **Ad Copy Agent**: High-converting ad copy for FB, Google, LinkedIn
- **Ad Hook Agent**: Scroll-stopping hooks
- **Audience Research Agent**: Deep customer avatar analysis

### Content & Copy
- **Headline Agent**: Optimized headlines for landing pages
- **Brand Voice Agent**: Define brand personality

### Strategy & Funnels
- **Sales Page Agent**: Long-form sales letters
- **Funnel Builder Agent**: Complete funnel strategies
- **Offer Builder Agent**: Irresistible offers
- **Webinar Agent**: Webinar scripts and reminders

### Communication
- **Email Agent**: Email sequences and campaigns
- **WhatsApp Agent**: Direct messaging scripts
- **CRM Follow-Up Agent**: Sales follow-up scripts

### Video & Creative
- **Video Ads Agent**: Video scripts and storyboards

### Analytics
- **Analytics & A/B Agent**: Performance analysis and testing

## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI**: Google Gemini API
- **Backend**: Supabase (Auth + Database)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📚 Documentation

- [Issue Tracker](https://github.com/itskiranbabu/RevenuePilot/issues/1) - Full deployment checklist
- [AI Studio App](https://ai.studio/apps/drive/16WvBif_eITIlg1VhGktbrnP-ruNscDHi)

## 🐛 Troubleshooting

### Blank Screen on Deployment
**Fixed!** ✅ The issue was missing `main.tsx` entry point and script tag in `index.html`.

### Environment Variables Not Working
Make sure to add `GEMINI_API_KEY` in Vercel → Settings → Environment Variables, then redeploy.

### Database Errors
Run the SQL schema in Supabase SQL Editor to create required tables.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Powered by [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)

---

**Status**: ✅ Core features complete | ⚠️ Pending: Environment variables setup

For detailed next steps, see [Issue #1](https://github.com/itskiranbabu/RevenuePilot/issues/1)
