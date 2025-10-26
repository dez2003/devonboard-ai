# Stage 0: Tool Setup & Prerequisites - Walkthrough

## Overview

This stage will get you ready with all accounts, API keys, and development tools needed for Devonboard AI.

**Estimated Time**: 1-2 hours
**Goal**: Have all tools configured and ready to use

---

## ✅ Checklist Overview

- [ ] Development environment (Node.js, VS Code, Git)
- [ ] Anthropic account + Claude API key
- [ ] Composio account + GitHub integration
- [ ] Supabase project + database credentials
- [ ] GitHub OAuth app
- [ ] Creao account (for web dashboard)
- [ ] Project structure created
- [ ] Environment variables documented

---

## Step 1: Development Environment Setup

### 1.1 Install Required Software

**Node.js 18+**
```bash
# Check if installed
node --version

# If not installed, download from:
# https://nodejs.org (choose LTS version)
```

**VS Code**
```bash
# Download from:
# https://code.visualstudio.com
```

**Git**
```bash
# Check if installed
git --version

# If not installed:
# macOS: Install Xcode Command Line Tools
xcode-select --install

# Or download from: https://git-scm.com
```

### 1.2 Verify Installation

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
git --version     # Should show 2.x.x or higher
code --version    # Should show VS Code version
```

✅ **Mark complete when all versions display correctly**

---

## Step 2: Create Project Structure

```bash
# Navigate to your development directory
cd ~/Desktop/devonboard-ai

# Create sub-directories
mkdir backend extension docs temp

# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules
.env
.env.local
dist
*.vsix
.DS_Store
temp/*
EOF

# Create .env template
touch .env
touch .env.example
```

Your structure should look like:
```
devonboard-ai/
├── backend/          # Next.js web app
├── extension/        # VS Code extension
├── docs/            # Documentation (md files already here)
├── temp/            # Temporary files
├── .env             # Your secrets (DO NOT COMMIT)
├── .env.example     # Template (safe to commit)
└── .gitignore
```

✅ **Mark complete when directories are created**

---

## Step 3: Anthropic (Claude) Setup

### 3.1 Create Account

1. Go to: https://console.anthropic.com
2. Click "Sign Up"
3. Use your email or GitHub to sign up
4. Verify your email

### 3.2 Get API Key

1. Once logged in, click your profile (top right)
2. Navigate to "API Keys"
3. Click "Create Key"
4. Give it a name: `devonboard-ai-dev`
5. **Copy the key immediately** (starts with `sk-ant-...`)
6. Store it safely (you won't see it again!)

### 3.3 Add to .env

Open `.env` in VS Code and add:
```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.4 Test Connection

```bash
# Install curl if needed (usually pre-installed on macOS)

# Test the API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**Expected Response**: JSON with a message from Claude

### 3.5 Pricing Info

- **Input**: $3 per 1M tokens
- **Output**: $15 per 1M tokens
- **Estimated dev cost**: $5-10 total for this project

✅ **Mark complete when test succeeds**

---

## Step 4: Composio Setup

### 4.1 Create Account

1. Go to: https://app.composio.dev
2. Click "Sign Up with GitHub"
3. Authorize the GitHub app
4. Complete profile setup

### 4.2 Get API Key

1. In Composio dashboard, click "Settings" (left sidebar)
2. Navigate to "API Keys"
3. Click "Create API Key"
4. Copy the key

### 4.3 Add to .env

```bash
# Composio API
COMPOSIO_API_KEY=your_composio_api_key_here
```

### 4.4 Install CLI

```bash
# Install globally
npm install -g composio-core

# Login
composio login
# Paste your API key when prompted

# Verify
composio whoami
```

### 4.5 Connect GitHub Integration

```bash
# Add GitHub integration
composio add github

# This will:
# 1. Open browser
# 2. Ask you to authorize GitHub
# 3. Return to CLI when done

# Verify connection
composio apps
# Should show: github (connected)
```

### 4.6 Test GitHub Access

```bash
# List your repos
composio triggers github

# You should see available GitHub events like:
# - GITHUB_PUSH_EVENT
# - GITHUB_PULL_REQUEST_EVENT
# etc.
```

✅ **Mark complete when GitHub is connected**

---

## Step 5: Supabase Setup

### 5.1 Create Account

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended)

### 5.2 Create Project

1. Click "New Project"
2. Choose organization: Create new or use existing
3. Fill in:
   - **Name**: `devonboard-ai`
   - **Database Password**: Generate a strong password and **save it**
   - **Region**: Choose closest to you (e.g., US West)
4. Click "Create new project"
5. **Wait 2-3 minutes** for provisioning (get coffee ☕)

### 5.3 Get API Keys

1. Once ready, click "Settings" (gear icon, bottom left)
2. Click "API" in the sidebar
3. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (click "Reveal" first)
```

### 5.4 Add to .env

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=your_database_password_here
```

### 5.5 Test Connection

1. In Supabase dashboard, click "SQL Editor"
2. Run this query:
   ```sql
   SELECT NOW();
   ```
3. Should return current timestamp

✅ **Mark complete when test query works**

---

## Step 6: GitHub OAuth App Setup

### 6.1 Create OAuth App

1. Go to: https://github.com/settings/developers
2. Click "OAuth Apps"
3. Click "New OAuth App"
4. Fill in:
   ```
   Application name: Devonboard AI (Dev)
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```
5. Click "Register application"

### 6.2 Get Credentials

1. You'll see your **Client ID** - copy it
2. Click "Generate a new client secret"
3. Copy the **Client Secret** (won't see it again!)

### 6.3 Add to .env

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6.4 Create Personal Access Token (for Composio)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `devonboard-ai-dev`
4. Scopes: Select:
   - `repo` (full control)
   - `read:org`
   - `read:user`
5. Click "Generate token"
6. Copy the token

```bash
# GitHub Personal Access Token (for API access)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ **Mark complete when OAuth app is created**

---

## Step 7: Creao Setup (Web Dashboard)

Based on the workshop file you provided, here's how to set up Creao for building the dashboard.

### 7.1 Create Creao Account

1. Go to: https://app.creao.ai
2. Click "Sign Up" or "Get Started"
3. Sign up with GitHub (recommended)
4. Complete onboarding

### 7.2 Understand Creao's Features

Creao offers:
- **Chat-to-Build**: Describe what you want, AI builds it
- **MCP Integration**: Connect custom tools and services
- **Figma Import**: Import designs directly
- **AI-Powered Code Generation**: Rapid prototyping

### 7.3 Create New Project (We'll do this in Stage 8)

For now, just explore the interface:
1. Click "New Project"
2. Browse templates
3. Familiarize yourself with the chat interface
4. **Don't build anything yet** - we'll use this in Stage 8

### 7.4 Get API Key (if available)

1. Check for "Settings" or "API Keys" section
2. If available, generate an API key
3. Add to `.env`:

```bash
# Creao (for web dashboard)
CREAO_API_KEY=your_creao_api_key_here
```

**Note**: Creao may be primarily a web-based tool. We'll use it through their web interface for building the dashboard.

### 7.5 Bookmark Important Pages

- Documentation: https://docs.creao.ai
- MCP Integration: https://docs.creao.ai/integrations/custom-mcp-integrations
- Figma Import: https://docs.creao.ai/integrations/figma-design-import

✅ **Mark complete when account is created**

---

## Step 8: Optional Tools (Can Skip for Now)

### CodeRabbit (for Stage 9)

We'll set this up later, but if you want to get it now:

1. Go to: https://coderabbit.ai
2. Sign up with GitHub
3. Install app on your repositories
4. Get API key from dashboard

```bash
# CodeRabbit (optional - for Stage 9)
CODERABBIT_API_KEY=your_key_here
```

✅ **Skip for now** - we'll do this in Stage 9

---

## Step 9: Create .env.example Template

Create a safe template that can be committed to git:

```bash
# Copy your .env to .env.example, removing actual values
cat > .env.example << 'EOF'
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Composio API
COMPOSIO_API_KEY=your_composio_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_PASSWORD=your_password

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1...
GITHUB_CLIENT_SECRET=your_secret
GITHUB_TOKEN=ghp_...

# Creao (optional)
CREAO_API_KEY=your_key

# CodeRabbit (Stage 9)
CODERABBIT_API_KEY=your_key
EOF
```

---

## Step 10: Verify Everything

### 10.1 Check .env File

Your `.env` should have these variables (with real values):

```bash
cat .env
```

Expected output:
```
ANTHROPIC_API_KEY=sk-ant-...
COMPOSIO_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_TOKEN=ghp_...
```

### 10.2 Test Composio

```bash
composio apps
# Should show: github
```

### 10.3 Final Checklist

- [ ] Node.js 18+ installed
- [ ] VS Code installed
- [ ] Project directories created
- [ ] `.env` file exists with all keys
- [ ] Anthropic API key tested
- [ ] Composio CLI installed and GitHub connected
- [ ] Supabase project created
- [ ] GitHub OAuth app created
- [ ] Creao account created
- [ ] `.gitignore` configured to exclude `.env`

---

## 🎉 Stage 0 Complete!

You're now ready to start building! Your development environment is fully set up.

**Next Steps:**
1. Let me know you've completed Stage 0
2. We'll move to **Stage 1: Backend Foundation**
3. Initialize Next.js project and create first API endpoints

---

## 💾 Backup Your Keys!

**IMPORTANT**: Save your `.env` file somewhere safe (like a password manager):
- 1Password
- LastPass
- Bitwarden
- Or encrypted notes app

If you lose these keys, you'll need to regenerate them!

---

## 🆘 Troubleshooting

### Composio login fails
```bash
# Clear cache and retry
rm -rf ~/.composio
composio login
```

### Supabase connection issues
- Check if project is still provisioning (takes 2-3 min)
- Verify URL doesn't have trailing slash
- Check if using correct key (anon vs service_role)

### GitHub OAuth not working
- Ensure callback URL is exactly: `http://localhost:3000/api/auth/callback/github`
- No trailing slash
- Must be http (not https) for localhost

---

## 📸 Screenshot Your Progress

Take screenshots of:
1. Composio dashboard showing GitHub connected
2. Supabase project dashboard
3. GitHub OAuth app settings
4. Your `.env` file (blur the actual keys!)

This helps with debugging later if needed.

---

**Ready to continue?** Let me know when you've completed these steps and we'll move to Stage 1! 🚀
