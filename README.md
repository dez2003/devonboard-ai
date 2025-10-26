# Devonboard AI 🚀

> Get new developers coding in hours, not weeks.

**Devonboard AI** is an AI-powered developer onboarding assistant that reduces time-to-first-commit from weeks to hours. It combines a VS Code extension with an intelligent web dashboard, featuring **auto-sync** that automatically updates onboarding content when source documentation changes.

## ✨ Features

- 🎯 **VS Code Integration** - Onboarding checklist directly in your IDE
- 🤖 **AI-Powered Guidance** - Claude analyzes repos and generates personalized onboarding plans
- 🔄 **Auto-Sync** - Documentation changes automatically update onboarding steps
- 📊 **Admin Dashboard** - Track progress, manage teams, view analytics
- 🔌 **Smart Integrations** - GitHub, Notion, Confluence monitoring via Composio
- 💡 **Code Context** - Intelligent tooltips and explanations via CodeRabbit

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPER EXPERIENCE                  │
├─────────────────────────────────────────────────────────┤
│  VS Code Extension          Web Dashboard (Creao)       │
│  • Onboarding Checklist     • Admin Setup               │
│  • Progress Tracking        • Analytics                 │
│  • AI Assistant             • Team Management           │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             └────────┬───────────────┘
                      │
         ┌────────────▼──────────────┐
         │   Next.js Backend API     │
         │   • Supabase Database     │
         │   • Claude Agent SDK      │
         │   • Composio Integration  │
         └────────────┬──────────────┘
                      │
         ┌────────────▼──────────────┐
         │   AUTO-SYNC ENGINE        │
         │   • GitHub monitoring     │
         │   • Change detection      │
         │   • AI analysis           │
         │   • Content updates       │
         └───────────────────────────┘
```

## 🛠️ Tech Stack

- **VS Code Extension**: TypeScript + VS Code Extension API
- **Backend**: Next.js 14 + TypeScript
- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **AI**: Claude 3.5 Sonnet (Anthropic Agent SDK)
- **Integrations**: Composio (GitHub, Notion, Confluence)
- **Dashboard**: Creao (AI-powered chat-to-build)
- **Code Context**: CodeRabbit MCP

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org)
- **VS Code** - [Download](https://code.visualstudio.com)
- **Git** - [Download](https://git-scm.com)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/devonboard-ai.git
cd devonboard-ai
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy template
cp .env.example .env

# Open and fill in your API keys
code .env
```

Required environment variables:

```bash
# Claude API (https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Composio API (https://app.composio.dev)
COMPOSIO_API_KEY=...

# Supabase (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=Iv1...
GITHUB_CLIENT_SECRET=...
GITHUB_TOKEN=ghp_...
```

See [Getting API Keys](#-getting-api-keys) below for detailed instructions.

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install extension dependencies
cd ../extension
npm install
```

### 4. Set Up Database

```bash
# Navigate to Supabase dashboard
# Go to SQL Editor and run the schema from:
# docs/database-schema.sql
```

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

### 5. Run the Backend

```bash
cd backend
npm run dev
```

Backend will be available at `http://localhost:3000`

### 6. Run the VS Code Extension

```bash
cd extension

# Compile TypeScript
npm run compile

# Open in VS Code
code .

# Press F5 to launch Extension Development Host
```

## 🔑 Getting API Keys

### Anthropic (Claude)

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

**Pricing**: ~$5-10 for development

### Composio

1. Go to https://app.composio.dev
2. Sign up with GitHub
3. Navigate to **Settings** → **API Keys**
4. Copy your API key
5. Install CLI: `npm install -g composio-core`
6. Login: `composio login`
7. Connect GitHub: `composio add github`

**Pricing**: Free tier (1000 calls/month)

### Supabase

1. Go to https://supabase.com
2. Create new project (takes 2-3 minutes)
3. Go to **Settings** → **API**
4. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

**Pricing**: Free tier (500MB database)

### GitHub OAuth

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Devonboard AI
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and **Client Secret**

### Creao (Optional - for dashboard)

1. Go to https://app.creao.ai
2. Sign up with GitHub
3. Explore the platform (we'll use this in Stage 8)

## 📖 Usage

### For Developers (Using the Extension)

1. **Open VS Code** in your project directory
2. **Look for Devonboard AI icon** in the Activity Bar (left sidebar)
3. **Click to open** the onboarding checklist
4. **Set your plan**: Command Palette → "Devonboard: Set Plan" → Enter plan ID
5. **Follow the steps**: Click each step to see detailed instructions
6. **Mark complete**: Click "Mark Complete" as you finish each step
7. **Track progress**: Your progress syncs to the dashboard

### For Admins (Using the Dashboard)

1. **Open dashboard**: `http://localhost:3000/dashboard`
2. **Sign in** with GitHub
3. **Create organization**: Click "New Organization"
4. **Analyze repository**:
   - Enter repository URL
   - Click "Analyze with AI"
   - Review generated onboarding plan
5. **Monitor team**: View analytics and progress
6. **Auto-sync**: Changes to docs automatically update plans

### Auto-Sync Feature

The killer feature! Here's how it works:

1. **Admin sets up monitoring**:
   ```bash
   # In dashboard: Add documentation source
   Source Type: GitHub
   Repository: https://github.com/your/repo
   Files to watch: README.md, docs/*.md
   ```

2. **Developer edits README**:
   ```bash
   # Edit README.md with new setup steps
   git commit -m "Update installation instructions"
   git push
   ```

3. **Auto-sync triggers**:
   - Composio detects the change (webhook)
   - Claude analyzes impact on onboarding
   - Affected steps auto-update
   - Notification sent to VS Code extension

4. **Developer sees update**:
   - Badge appears: "Updates Available"
   - Click to review changes
   - Accept or dismiss updates

## 🧪 Testing

### Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Create organization
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Company"}'

# Analyze repository
curl -X POST http://localhost:3000/api/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/vercel/next.js",
    "organizationId": "your-org-id"
  }'
```

### Extension

1. Press `F5` in VS Code (extension directory)
2. Extension Development Host opens
3. Check Activity Bar for Devonboard icon
4. Open the checklist
5. Test commands via Command Palette

### Auto-Sync

1. Set up ngrok: `ngrok http 3000`
2. Configure webhook in Composio
3. Edit a watched file in GitHub
4. Check change_log table in Supabase
5. Verify notification in extension

## 📁 Project Structure

```
devonboard-ai/
├── backend/                    # Next.js application
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── health/        # Health check
│   │   │   ├── organizations/ # Org management
│   │   │   ├── analyze-repo/  # Claude integration
│   │   │   ├── onboarding/    # Plans & steps
│   │   │   └── webhooks/      # GitHub webhooks
│   │   └── dashboard/         # Admin UI (Creao)
│   ├── lib/
│   │   ├── supabase/          # DB clients
│   │   ├── claude/            # AI integration
│   │   ├── composio/          # External integrations
│   │   └── workers/           # Background jobs
│   └── types/                 # TypeScript types
│
├── extension/                  # VS Code extension
│   ├── src/
│   │   ├── extension.ts       # Entry point
│   │   ├── treeview.ts        # Checklist UI
│   │   ├── webview.ts         # Detail panels
│   │   ├── api.ts             # Backend client
│   │   └── code-context.ts    # CodeRabbit MCP
│   └── package.json
│
├── docs/                       # Documentation
│   ├── implementation_plan.md
│   ├── claude.md
│   └── IMPLEMENTATION_STAGES.md
│
└── .env                        # Environment variables (DO NOT COMMIT!)
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Extension Development

```bash
cd extension

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch

# Package extension
vsce package

# Install locally
code --install-extension devonboard-ai-0.0.1.vsix
```

### Database Management

```bash
# Open Supabase Studio
supabase studio

# View logs
supabase logs

# Reset database (CAREFUL!)
supabase db reset
```

## 🌐 Deployment

### Backend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd backend
vercel

# Production deployment
vercel --prod
```

Update environment variables in Vercel dashboard.

### Extension (VS Code Marketplace)

```bash
cd extension

# Install vsce
npm install -g @vscode/vsce

# Package
vsce package

# Publish (requires publisher account)
vsce publish
```

### Database (Supabase)

Database is already hosted on Supabase. For production:

1. Enable Row Level Security policies
2. Set up database backups
3. Configure connection pooling
4. Monitor usage

## 📊 Monitoring & Analytics

### Backend Monitoring

- **Vercel Analytics**: Automatic for deployments
- **Supabase Dashboard**: Database metrics, API usage
- **Claude API**: Token usage at console.anthropic.com

### Extension Telemetry

```typescript
// In extension, track key events
vscode.window.showInformationMessage('Step completed');
// Log to backend for analytics
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check Node version
node --version  # Should be 18+

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

**Extension not loading**
```bash
# Recompile
npm run compile

# Check Output panel in VS Code
# View → Output → Select "Extension Host"
```

**Supabase connection fails**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test connection
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/
```

**Composio GitHub not connected**
```bash
# Re-authenticate
composio logout
composio login
composio add github
```

**Claude API errors**
```bash
# Check API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 1024, "messages": [{"role": "user", "content": "test"}]}'
```

### Debug Mode

**Backend**:
```bash
# Enable debug logging
DEBUG=* npm run dev
```

**Extension**:
```typescript
// In extension.ts
console.log('Debug info:', data);
// Check Debug Console in Extension Development Host
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Implementation Stages

This project is built in stages. See detailed guides:

- [Implementation Stages](docs/IMPLEMENTATION_STAGES.md) - Complete build guide
- [Claude Integration](docs/claude.md) - AI integration details
- [Implementation Plan](docs/implementation_plan.md) - Architecture & design

**Current Progress**: Stage 2 - Database & Authentication ✅

## 💰 Cost Estimate

Development costs:
- **Claude API**: $5-10 total
- **Supabase**: Free tier (sufficient)
- **Composio**: Free tier (sufficient)
- **Vercel**: Free tier (sufficient)
- **Creao**: Check pricing (may have free tier)

**Total**: ~$5-10 for development

Production costs scale with usage.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Anthropic Claude](https://anthropic.com) - AI intelligence
- [Composio](https://composio.dev) - Integration platform
- [Supabase](https://supabase.com) - Backend infrastructure
- [Creao](https://creao.ai) - Dashboard builder
- [CodeRabbit](https://coderabbit.ai) - Code context

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/devonboard-ai/issues)
- **Questions**: [Discussions](https://github.com/yourusername/devonboard-ai/discussions)

---

**Made with ❤️ for developers who deserve a great first day**
