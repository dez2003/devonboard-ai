# Devonboard AI

**AI-powered developer onboarding that automatically syncs with your existing documentation.**

Stop recreating content. Pull from Notion, GitHub, Confluence, Google Docs, and more. When docs change, onboarding updates automatically.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What It Does

Devonboard AI transforms scattered documentation into a seamless onboarding experience:

1. **Analyzes** your GitHub repository with Claude AI
2. **Generates** personalized onboarding steps automatically
3. **Pulls content** from existing docs (GitHub, Notion, Confluence, etc.)
4. **Auto-syncs** when documentation changes (< 5 seconds)
5. **Delivers** via VS Code extension for seamless developer experience

**Key Differentiator**: No duplicate content. Your docs remain the source of truth.

---

## ✨ Key Features

✅ **AI Repository Analysis** - Claude analyzes repos and generates personalized steps
✅ **Multi-Source Integration** - Pull from GitHub, Notion, Confluence, Google Docs, Slack
✅ **Real-Time Auto-Sync** - Changes propagate automatically in < 5 seconds
✅ **Source Attribution** - Always know where content came from
✅ **VS Code Native** - Seamless developer experience with interactive checklist
✅ **Smart Updates** - Only auto-updates safe changes (severity < 7)
✅ **Full Audit Trail** - Every change logged in database
✅ **Web Dashboard** - Admin panel for managing plans and viewing analytics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  External Documentation                      │
│  GitHub • Notion • Confluence • Google Docs • Slack          │
└────────────────────┬────────────────────────────────────────┘
                     │ Webhooks / Auto-Sync (< 5s)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│             Next.js Backend (Port 3000)                      │
│  • Claude AI Analysis (Repository Analyzer, Content Gen)    │
│  • Auto-Sync Engine (Change Detection & Updates)            │
│  • Webhook Handlers (GitHub, Notion, etc.)                  │
│  • Supabase Database (PostgreSQL + Realtime)                │
│  • Web Dashboard (Admin UI)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              VS Code Extension                               │
│  • Interactive onboarding checklist                          │
│  • Step-by-step guidance with commands                      │
│  • Progress tracking (synced to database)                   │
│  • Source attribution (links to original docs)              │
│  • Real-time updates                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **npm** or **pnpm**
- **VS Code** - [Download](https://code.visualstudio.com)
- **Accounts**:
  - [Anthropic (Claude API)](https://console.anthropic.com) - Required
  - [Supabase](https://supabase.com) - Required
  - [GitHub](https://github.com) - Required

---

## ⚡ Quick Start (10 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/devonboard-ai.git
cd devonboard-ai

# Install backend dependencies
cd backend
npm install

# Install extension dependencies
cd ../extension
npm install
```

### 2. Set Up Environment Variables

Create `backend/.env`:

```bash
# ============================================
# REQUIRED: Claude AI
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
# Get from: https://console.anthropic.com/settings/keys

# ============================================
# REQUIRED: GitHub API
# ============================================
GITHUB_TOKEN=ghp_xxxxx
# Get from: https://github.com/settings/tokens
# Permissions: repo (read access)

# ============================================
# REQUIRED: Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
# Get from: https://supabase.com/dashboard/project/_/settings/api

# ============================================
# REQUIRED: NextAuth
# ============================================
NEXTAUTH_SECRET=xxxxx
# Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# ============================================
# OPTIONAL: Webhook Security
# ============================================
GITHUB_WEBHOOK_SECRET=xxxxx
# Generate: openssl rand -hex 20
```

<details>
<summary><strong>📖 Detailed Instructions for Getting API Keys</strong></summary>

#### Anthropic Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy key (starts with `sk-ant-`)

**Cost**: ~$0.01-0.03 per repository analysis, $5-20/month typical usage

#### GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name: "Devonboard AI"
4. Select scopes: `repo` (full control of private repositories)
5. Click **Generate token**
6. Copy token (starts with `ghp_`)

**Important**: Save this token immediately - you can't see it again!

#### Supabase Database

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Create new organization (if needed)
4. Create new project:
   - Name: `devonboard-ai`
   - Database Password: (save this!)
   - Region: (closest to you)
5. Wait 2-3 minutes for provisioning
6. Go to **Settings** → **API**
7. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

**Cost**: Free tier (500MB database, 50GB bandwidth/month)

</details>

### 3. Set Up Database

```bash
cd backend

# Option A: Using Supabase Dashboard (Recommended)
# 1. Go to your Supabase project
# 2. Click "SQL Editor"
# 3. Click "New Query"
# 4. Copy/paste contents of: backend/supabase/migrations/001_initial_schema.sql
# 5. Click "Run"
# 6. Repeat for 002_progress_tracking.sql and 003_multi_source_documentation.sql

# Option B: Using Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Database Tables Created**:
- `organizations` - Companies using the platform
- `onboarding_plans` - Onboarding configurations
- `onboarding_steps` - Individual tasks
- `user_progress` - Developer progress tracking
- `documentation_sources` - Connected sources (GitHub, Notion, etc.)
- `source_changes` - Change history & auto-sync logs
- `step_sources` - Links steps to their source docs

### 4. Start Backend

```bash
cd backend
npm run dev
```

Backend runs on **http://localhost:3000**

**Verify it's working**:
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

### 5. Build & Install VS Code Extension

```bash
cd extension

# Compile TypeScript
npm run compile

# Package extension
npm run package
# Creates: devonboard-ai-0.1.0.vsix

# Install in VS Code
code --install-extension devonboard-ai-0.1.0.vsix

# Or manually: VS Code → Extensions → ... → Install from VSIX
```

**Verify it's working**:
1. Open VS Code
2. Look for Devonboard icon in Activity Bar (left sidebar)
3. Click to open onboarding panel

---

## 🚀 Using the System

### Step 1: Analyze a Repository

**Via Web Dashboard** (http://localhost:3000/dashboard):

1. Navigate to "Analyze Repository"
2. Enter GitHub URL: `https://github.com/vercel/next.js`
3. Click "Analyze Repository"
4. Wait ~10 seconds for Claude to analyze
5. Review generated onboarding steps

**Via API**:

```bash
curl -X POST http://localhost:3000/api/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/vercel/next.js",
    "generateSteps": true
  }'
```

**What Happens**:
1. Fetches repository structure from GitHub API
2. Claude analyzes tech stack, dependencies, setup requirements
3. Generates 8-15 personalized onboarding steps
4. Returns structured analysis with instructions, commands, verification steps

**Response Time**: 5-10 seconds
**Cost**: $0.01-0.03 per analysis

### Step 2: Connect Documentation Sources

```bash
curl -X POST http://localhost:3000/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "your-org-id",
    "planId": "your-plan-id",
    "sourceType": "github",
    "sourceUrl": "https://github.com/your-org/your-repo",
    "sourceName": "Engineering Wiki",
    "filePaths": ["README.md", "docs/setup.md"],
    "syncFrequency": "realtime"
  }'
```

**Supported Source Types**:
- `github` - README, markdown files, wikis ✅ **Working**
- `notion` - Pages and databases (coming soon)
- `confluence` - Spaces and pages (coming soon)
- `gdocs` - Google Docs (coming soon)
- `slack` - Pinned messages (coming soon)
- `linear` - Project docs (coming soon)

### Step 3: Set Up Auto-Sync

**The Showcase Feature** - Documentation changes auto-update onboarding steps!

#### For Local Development (using ngrok):

```bash
# 1. Install ngrok
brew install ngrok

# 2. Start tunnel
ngrok http 3000
# Copy the https URL (e.g., https://abc123.ngrok.io)

# 3. Configure GitHub webhook
# Go to repo → Settings → Webhooks → Add webhook
#   Payload URL: https://abc123.ngrok.io/api/webhook/github
#   Content type: application/json
#   Events: Just the push event
#   Active: ✓

# 4. Test it!
echo "## New Setup Step" >> README.md
git add . && git commit -m "Update docs" && git push

# 5. Watch backend logs
# Should see:
#   [Webhook] 📨 Received GitHub event: push
#   [SyncEngine] 🔄 Processing change...
#   [ChangeAnalyzer] Analyzing README.md...
#   [SyncEngine] ✅ Auto-updated: "Install dependencies"
```

#### For Production:

```bash
# Use your deployed backend URL
# Example: https://devonboard-ai.vercel.app/api/webhook/github
```

**What Happens**:
1. Developer commits doc change to GitHub → **< 1 second**
2. GitHub webhook fires → **< 1 second**
3. Backend detects change, fetches old/new content → **~2 seconds**
4. Claude analyzes impact (severity, affected steps) → **~3 seconds**
5. Auto-updates steps if safe (severity < 7) → **< 1 second**
6. Developer sees updated instructions in VS Code → **instant**

**Total Sync Time**: < 5 seconds end-to-end 🚀

### Step 4: Use VS Code Extension

1. **Open VS Code** in your project
2. **Click Devonboard icon** in Activity Bar
3. **Set plan ID**:
   - Command Palette (Cmd/Ctrl+Shift+P)
   - Type: "Devonboard: Set Plan ID"
   - Enter your plan UUID
4. **View steps** in sidebar
5. **Click step** to see details:
   - Instructions (markdown formatted)
   - Commands to run (clickable "Run" buttons)
   - Verification steps
   - Source attribution (links to original docs)
6. **Mark complete** when done
7. **Track progress** - syncs to database automatically

---

## 📁 Project Structure

```
devonboard-ai/
├── backend/                    # Next.js backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── analyze-repo/  # Claude repository analysis
│   │   │   ├── sources/       # Documentation source management
│   │   │   ├── webhook/       # GitHub webhook handler
│   │   │   └── onboarding/    # Plans & steps CRUD
│   │   └── dashboard/         # Web UI (React components)
│   ├── lib/
│   │   ├── claude/            # Claude AI agents
│   │   │   ├── client.ts              # Base Claude client
│   │   │   ├── repository-analyzer.ts # Repo analysis agent
│   │   │   ├── content-generator.ts   # Content generation
│   │   │   └── change-analyzer.ts     # Change detection
│   │   ├── supabase/          # Database clients
│   │   └── sync-engine.ts     # Auto-sync orchestration
│   ├── types/                 # TypeScript type definitions
│   ├── supabase/
│   │   └── migrations/        # Database schema SQL files
│   └── .env                   # Environment variables (DO NOT COMMIT!)
├── extension/                  # VS Code extension
│   ├── src/
│   │   ├── extension.ts       # Extension entry point
│   │   ├── treeview.ts        # Sidebar checklist UI
│   │   ├── webview.ts         # Step detail panel (HTML/CSS/JS)
│   │   ├── api.ts             # Backend HTTP client
│   │   └── types.ts           # Extension type definitions
│   ├── package.json           # Extension manifest
│   └── tsconfig.json
├── STAGE_4_TESTING.md         # Claude integration testing guide
├── STAGE_5_COMPLETE.md        # Multi-source integration guide
├── STAGE_6_COMPLETE.md        # Auto-sync testing guide
└── README.md                   # This file
```

---

## 🧪 Testing

### Test 1: Repository Analysis

```bash
cd backend

# Start backend
npm run dev

# In another terminal, run test script
npm run test:analyze https://github.com/vercel/next.js

# Expected output:
# 🔍 Devonboard AI - Repository Analysis Test
# ✅ Repository analysis complete! (5.2s)
# 📋 Tech Stack: TypeScript, React, Node.js
# 📝 Generated 12 onboarding steps
# 💾 Results saved to: analysis-result-[timestamp].json
```

### Test 2: Webhook (Manual Trigger)

```bash
curl -X POST http://localhost:3000/api/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -d '{
    "commits": [{
      "id": "abc123def",
      "message": "Update README",
      "modified": ["README.md"],
      "added": [],
      "removed": []
    }],
    "repository": {
      "html_url": "https://github.com/test/repo"
    },
    "ref": "refs/heads/main"
  }'

# Expected: Sync logs in terminal
```

### Test 3: VS Code Extension

1. Press **F5** in VS Code (with extension folder open)
2. Extension Development Host window opens
3. Check Activity Bar for Devonboard icon
4. Click to open panel
5. Test commands via Command Palette

---

## 🌐 Deployment

### Backend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd backend
vercel

# Production deployment
vercel --prod

# Set environment variables in Vercel dashboard
# https://vercel.com/your-project/settings/environment-variables
```

**Important**: Add all environment variables from `.env` to Vercel!

### Extension (VS Code Marketplace)

```bash
cd extension

# Install vsce
npm i -g @vscode/vsce

# Package
vsce package

# Publish (requires publisher account)
vsce publish

# Or share .vsix file directly
```

**Create publisher account**: [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)

---

## 🐛 Troubleshooting

<details>
<summary><strong>Backend won't start</strong></summary>

```bash
# Check Node version (must be 18+)
node --version

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat backend/.env
```

</details>

<details>
<summary><strong>Claude API errors</strong></summary>

```bash
# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'

# Should return a response, not 401 Unauthorized
```

</details>

<details>
<summary><strong>Supabase connection fails</strong></summary>

```bash
# Verify environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/

# Should return API info, not error
```

</details>

<details>
<summary><strong>Webhook not firing</strong></summary>

**Debug steps:**
1. Check ngrok is running: `curl https://your-ngrok-url/api/webhook/github`
2. Check GitHub webhook deliveries: Repo → Settings → Webhooks → Recent Deliveries
3. Look for errors in response
4. Check backend logs for incoming requests

</details>

<details>
<summary><strong>Extension not loading</strong></summary>

```bash
cd extension

# Recompile
npm run compile

# Check for errors
npm run lint

# Reinstall
npm run package
code --install-extension devonboard-ai-0.1.0.vsix --force

# Check VS Code Output panel
# View → Output → Select "Extension Host"
```

</details>

---

## 💰 Cost Estimates

| Component | Development | Production (100 users) |
|-----------|-------------|------------------------|
| **Anthropic Claude API** | $5-10 | $20-50/month |
| **Supabase** | Free | Free-$25/month |
| **Vercel** | Free | Free-$20/month |
| **GitHub API** | Free | Free |
| **Total** | **$5-10** | **$20-95/month** |

**Per Operation**:
- Repository analysis: $0.01-0.03
- Auto-sync (per change): $0.005-0.01
- Content generation: $0.02-0.05

---

## 📚 Documentation

- [Stage 4: Claude Integration](STAGE_4_TESTING.md) - Testing repository analysis
- [Stage 5: Multi-Source Integration](STAGE_5_COMPLETE.md) - Documentation sources
- [Stage 6: Auto-Sync Engine](STAGE_6_COMPLETE.md) - Webhook setup & testing
- [Claude Integration Guide](CLAUDE.md) - AI agents architecture

---

## 🗺️ Roadmap

- [x] Repository analysis with Claude AI
- [x] Automated content generation
- [x] VS Code extension with interactive UI
- [x] GitHub auto-sync (< 5 seconds)
- [x] Web dashboard
- [x] Source attribution
- [ ] Notion integration
- [ ] Confluence integration
- [ ] Google Docs integration
- [ ] Slack integration
- [ ] Change review UI
- [ ] Email notifications
- [ ] Team analytics dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with:
- [Anthropic Claude](https://anthropic.com) - AI intelligence
- [Supabase](https://supabase.com) - Database & Auth
- [Vercel](https://vercel.com) - Hosting
- [VS Code](https://code.visualstudio.com) - Extension platform
- [Next.js](https://nextjs.org) - React framework

---

## ⭐ Support

If you find Devonboard AI useful, please:
- ⭐ Star the repository
- 🐛 Report bugs via [Issues](https://github.com/YOUR_USERNAME/devonboard-ai/issues)
- 💬 Ask questions in [Discussions](https://github.com/YOUR_USERNAME/devonboard-ai/discussions)
- 🔄 Share with your team!

---

**Built with ❤️ for developers who hate recreating content.**

**Devonboard AI** - Because your docs should work harder, not you.
