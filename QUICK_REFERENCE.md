# Devonboard AI - Quick Reference Card

## 🔑 All Your Links in One Place

### Accounts & Dashboards

| Service | Dashboard URL | Purpose |
|---------|---------------|---------|
| **Claude** | https://console.anthropic.com | AI for repo analysis, content generation |
| **Composio** | https://app.composio.dev | GitHub/Notion/Confluence integrations |
| **Supabase** | https://supabase.com/dashboard | Database, Auth, Realtime |
| **Creao** | https://app.creao.ai | AI-powered dashboard builder |
| **GitHub OAuth** | https://github.com/settings/developers | OAuth app management |
| **CodeRabbit** | https://coderabbit.ai | Code context (Stage 9) |

---

## 📋 Environment Variables Checklist

```bash
# Copy this to your .env file and fill in the values

# ============================================
# Claude API
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
# Get from: https://console.anthropic.com/settings/keys

# ============================================
# Composio API
# ============================================
COMPOSIO_API_KEY=xxxxx
# Get from: https://app.composio.dev/settings/api-keys

# ============================================
# Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_DB_PASSWORD=xxxxx
# Get from: https://supabase.com/dashboard/project/_/settings/api

# ============================================
# GitHub OAuth
# ============================================
GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_TOKEN=ghp_xxxxx
# OAuth: https://github.com/settings/developers
# Token: https://github.com/settings/tokens

# ============================================
# Creao (Optional)
# ============================================
CREAO_API_KEY=xxxxx
# Get from: https://app.creao.ai (if available)

# ============================================
# CodeRabbit (Stage 9 - Optional)
# ============================================
CODERABBIT_API_KEY=xxxxx
# Get from: https://coderabbit.ai/dashboard
```

---

## 🛠️ CLI Commands Quick Reference

### Composio
```bash
# Login
composio login

# Check connected apps
composio apps

# Add GitHub integration
composio add github

# List available triggers
composio triggers github

# Check current user
composio whoami
```

### Git
```bash
# Initialize repo
git init

# Add all files
git add .

# Commit
git commit -m "Stage X complete"

# Check status
git status
```

### Node/NPM
```bash
# Check version
node --version
npm --version

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### VS Code Extension Development
```bash
# Package extension
vsce package

# Install extension locally
code --install-extension devonboard-ai-0.0.1.vsix
```

---

## 📊 Project Structure

```
devonboard-ai/
├── backend/                    # Next.js web application
│   ├── app/                   # App router pages
│   │   ├── api/              # API routes
│   │   └── dashboard/        # Dashboard pages (Creao-generated)
│   ├── lib/                  # Utility libraries
│   │   ├── supabase/         # Database clients
│   │   ├── claude/           # AI integration
│   │   └── composio/         # External integrations
│   └── types/                # TypeScript definitions
│
├── extension/                 # VS Code extension
│   ├── src/
│   │   ├── extension.ts      # Entry point
│   │   ├── treeview.ts       # Checklist UI
│   │   ├── webview.ts        # Detail panels
│   │   └── api.ts            # Backend API client
│   └── package.json
│
├── docs/                      # Documentation
│   ├── implementation_plan.md
│   ├── claude.md
│   ├── IMPLEMENTATION_STAGES.md
│   ├── STAGE_0_SETUP_GUIDE.md
│   ├── CREAO_INTEGRATION.md
│   └── QUICK_REFERENCE.md    # ← You are here
│
├── .env                       # Your secrets (NEVER COMMIT!)
├── .env.example              # Template (safe to commit)
└── .gitignore
```

---

## 🎯 Implementation Progress Tracker

### Stage 0: Tool Setup ⏳
- [ ] Development environment installed
- [ ] Claude API key obtained
- [ ] Composio account + GitHub connected
- [ ] Supabase project created
- [ ] GitHub OAuth app created
- [ ] Creao account created
- [ ] All keys in .env file

### Stage 1: Backend Foundation
- [ ] Next.js initialized
- [ ] Supabase client configured
- [ ] Health check endpoint working

### Stage 2: Database & Auth
- [ ] Database schema created
- [ ] NextAuth.js configured
- [ ] GitHub OAuth working

### Stage 3: VS Code Extension
- [ ] Extension project initialized
- [ ] TreeView displaying checklist
- [ ] Commands registered

### Stage 4: Claude Integration
- [ ] Repository analysis working
- [ ] Onboarding plan generation
- [ ] Steps stored in database

### Stage 5: Manual Onboarding Flow
- [ ] Extension fetches real data
- [ ] Step details display
- [ ] Progress tracking works

### Stage 6: Composio + GitHub
- [ ] Webhook handler created
- [ ] GitHub changes detected
- [ ] Changes logged in database

### Stage 7: Auto-Sync Engine ⭐
- [ ] Change analysis working
- [ ] Content updates generated
- [ ] Real-time notifications

### Stage 8: Web Dashboard (Creao)
- [ ] API documentation prepared
- [ ] Dashboard built with Creao
- [ ] Analytics working

### Stage 9: CodeRabbit MCP
- [ ] MCP server configured
- [ ] Code tooltips working

### Stage 10: Polish & Deploy
- [ ] End-to-end testing
- [ ] Production deployment
- [ ] Demo ready

---

## 🔧 Common Commands for Each Stage

### Stage 1-2: Backend Development
```bash
cd backend
npm run dev                    # Start dev server
curl http://localhost:3000/api/health  # Test API
```

### Stage 3-5: Extension Development
```bash
cd extension
npm run compile               # Compile TypeScript
# Press F5 in VS Code to launch Extension Development Host
```

### Stage 6-7: Integration Testing
```bash
# Start ngrok for webhooks
ngrok http 3000

# Check Composio triggers
composio triggers github

# Process changes manually
curl -X POST http://localhost:3000/api/process-changes
```

### Stage 8: Dashboard with Creao
```bash
# Export OpenAPI spec
npm run generate-openapi

# Deploy to Vercel
vercel deploy
```

---

## 🚨 Troubleshooting Quick Fixes

### "Composio command not found"
```bash
npm install -g composio-core
composio login
```

### "Supabase connection failed"
```bash
# Check if project is still provisioning (wait 2-3 min)
# Verify no trailing slash in SUPABASE_URL
# Check you're using correct key (anon vs service_role)
```

### "GitHub OAuth redirect fails"
```bash
# Ensure callback URL is exactly:
# http://localhost:3000/api/auth/callback/github
# (no https, no trailing slash)
```

### "Extension doesn't load in VS Code"
```bash
cd extension
npm install
npm run compile
# Press F5 again
```

### "Claude API rate limit"
```bash
# You're making too many requests
# Add delays between calls
# Check pricing tier limits
```

---

## 💰 Cost Tracking

### Claude API
- **Input**: $3 per 1M tokens
- **Output**: $15 per 1M tokens
- **Estimated**: $5-10 for entire project

### Supabase
- **Free tier**: 500MB database, 2GB bandwidth
- **Estimated**: $0 (free tier sufficient)

### Composio
- **Free tier**: 1000 API calls/month
- **Estimated**: $0 (free tier sufficient)

### Creao
- **Check their pricing**: https://creao.ai/pricing
- **Estimated**: TBD (may have free tier)

### Vercel
- **Free tier**: 100GB bandwidth, serverless functions
- **Estimated**: $0 (free tier sufficient)

**Total estimated cost**: $5-10 for development

---

## 📞 Support & Resources

### Documentation
- **Claude**: https://docs.anthropic.com
- **Composio**: https://docs.composio.dev
- **Supabase**: https://supabase.com/docs
- **Creao**: https://docs.creao.ai
- **VS Code Extensions**: https://code.visualstudio.com/api

### Community
- **Composio Discord**: https://discord.gg/composio
- **Supabase Discord**: https://discord.supabase.com
- **VS Code Extensions**: https://aka.ms/vscode-discussions

### Anthropic Support
- **API Status**: https://status.anthropic.com
- **Support**: support@anthropic.com

---

## 🎯 Next Steps

1. **Complete Stage 0** using [STAGE_0_SETUP_GUIDE.md](STAGE_0_SETUP_GUIDE.md)
2. **Verify all tools** are working
3. **Commit your progress**: `git commit -m "Complete Stage 0 setup"`
4. **Move to Stage 1**: Backend foundation

---

## 📝 Notes Section

Use this space to track:
- API call counts
- Issues encountered
- Solutions found
- Ideas for improvements

```
Date: __________
Issue:
Solution:

Date: __________
Issue:
Solution:
```

---

**Last Updated**: Stage 0 Setup
**Next Milestone**: Stage 1 - Backend Foundation

Keep this file open in a tab for quick reference! 🚀
