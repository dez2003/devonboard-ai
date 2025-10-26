# Devonboard AI - Implementation Stages

## 🎯 Tool Selection & Rationale

After reviewing all options, here's the recommended tech stack:

### Selected Tools

| Tool | Purpose | Why This Tool |
|------|---------|---------------|
| **Claude Agent SDK** | Core AI intelligence, content generation, analysis | Most powerful for autonomous reasoning and content generation |
| **Composio** | External integrations (GitHub, Notion, Confluence) | Pre-built integrations for 150+ tools, works natively with Claude, easier than building custom APIs |
| **CodeRabbit MCP** | Code context in VS Code | Provides intelligent code understanding directly in IDE |
| **Supabase** | Database, Auth, Realtime | All-in-one solution with PostgreSQL, built-in auth, and websockets |

### Why Composio Over Fetch.ai?

**Composio Advantages**:
- ✅ Pre-built integrations for GitHub, Notion, Confluence, Slack
- ✅ Works directly with Claude Agent SDK
- ✅ Simpler setup for hackathon timeline
- ✅ Handles auth/webhooks automatically
- ✅ Better documentation and examples

**Fetch.ai** is powerful for autonomous agents but overkill for our monitoring needs. Composio gives us the same integration capabilities with less complexity.

### Optional: Creao

**Decision**: Skip Creao, use Claude directly for chat
- Claude Agent SDK already provides conversational capabilities
- Simpler stack = faster development
- Can add Creao later if needed for specialized chat features

---

## 📋 Implementation Stages Overview

```
Stage 0: Prerequisites & Tool Setup (1-2 hours)
         ↓
Stage 1: Backend Foundation (3-4 hours)
         ↓ [Testable: API endpoints work]
Stage 2: Database & Auth (2-3 hours)
         ↓ [Testable: Can create org, login]
Stage 3: Basic VS Code Extension (4-5 hours)
         ↓ [Testable: Extension loads, shows UI]
Stage 4: Claude Integration - Repo Analysis (3-4 hours)
         ↓ [Testable: Can analyze a repo, generate plan]
Stage 5: Manual Onboarding Flow (3-4 hours)
         ↓ [Testable: Complete onboarding checklist]
Stage 6: Composio + GitHub Integration (3-4 hours)
         ↓ [Testable: Detect GitHub changes]
Stage 7: Auto-Sync Engine (4-5 hours)
         ↓ [Testable: Doc change → auto update]
Stage 8: Web Dashboard (4-5 hours)
         ↓ [Testable: Admin can manage onboarding]
Stage 9: CodeRabbit MCP Integration (2-3 hours)
         ↓ [Testable: Code tooltips work]
Stage 10: Polish & Production Ready (3-4 hours)
         ↓ [Testable: End-to-end demo]

Total: ~32-42 hours (4-5 days intensive work)
```

---

## Stage 0: Prerequisites & Tool Setup

**Duration**: 1-2 hours
**Goal**: Get all accounts, API keys, and development environment ready

### 0.1 Development Environment

```bash
# Required installations
- Node.js 18+ (https://nodejs.org)
- VS Code (https://code.visualstudio.com)
- Git
- PostgreSQL (optional, using Supabase)
```

### 0.2 Create Project Structure

```bash
mkdir devonboard-ai
cd devonboard-ai

# Create sub-projects
mkdir backend
mkdir extension
mkdir docs

# Initialize git
git init
echo "node_modules\n.env\n.env.local\ndist" > .gitignore
```

### 0.3 Anthropic (Claude) Setup

**Steps**:
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-...`)
6. Store in `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

**Pricing**:
- $3 per million input tokens
- $15 per million output tokens
- Estimated cost: $5-10 for development

**Test Connection**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 0.4 Composio Setup

**Steps**:
1. Go to https://app.composio.dev
2. Sign up with GitHub
3. Navigate to "API Keys" in dashboard
4. Copy API key
5. Store in `.env`:
   ```
   COMPOSIO_API_KEY=your_composio_key
   ```

**Install CLI**:
```bash
npm install -g composio-core
composio login
```

**Connect Integrations**:
```bash
# Connect GitHub
composio add github

# Connect Notion (when ready)
composio add notion

# Connect Confluence (when ready)
composio add confluence
```

**Verify Setup**:
```bash
composio apps
# Should show: github, notion, confluence (if added)
```

**Documentation**: https://docs.composio.dev/introduction/intro/overview

### 0.5 Supabase Setup

**Steps**:
1. Go to https://supabase.com
2. Click "Start your project"
3. Create new organization
4. Create new project:
   - Name: `devonboard-ai`
   - Database Password: (save this!)
   - Region: (closest to you)
5. Wait 2-3 minutes for provisioning
6. Go to Project Settings → API
7. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
8. Store in `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

**Install Supabase CLI** (optional but recommended):
```bash
npm install -g supabase
supabase login
```

### 0.6 GitHub OAuth App Setup

**Steps**:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Devonboard AI`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy Client ID
6. Click "Generate a new client secret"
7. Copy Client Secret
8. Store in `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### 0.7 CodeRabbit Setup (Optional - Stage 9)

**Steps**:
1. Go to https://coderabbit.ai
2. Sign up with GitHub
3. Install CodeRabbit app on your repositories
4. Get API key from dashboard
5. Store in `.env`:
   ```
   CODERABBIT_API_KEY=your_key
   ```

**Note**: Can skip this initially, add in Stage 9

### ✅ Stage 0 Checklist

- [ ] Node.js 18+ installed
- [ ] VS Code installed
- [ ] Project structure created
- [ ] `.env` file created with all keys
- [ ] Anthropic API key obtained and tested
- [ ] Composio account created and CLI installed
- [ ] Composio GitHub integration connected
- [ ] Supabase project created
- [ ] GitHub OAuth app created
- [ ] All environment variables documented

**Test**: Run `composio apps` and verify GitHub is connected

---

## Stage 1: Backend Foundation

**Duration**: 3-4 hours
**Goal**: Next.js app with basic API routes and Supabase connection

### 1.1 Initialize Next.js Project

```bash
cd backend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

Options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: Yes (@/*)

### 1.2 Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install composio-core
npm install next-auth@beta
npm install zod
npm install date-fns
```

### 1.3 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── organizations/route.ts
│   │   └── onboarding/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── claude/
│   │   └── client.ts
│   └── composio/
│       └── client.ts
├── types/
│   └── index.ts
└── .env.local
```

### 1.4 Create Supabase Client

**File**: `lib/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**File**: `lib/supabase/server.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 1.5 Create Health Check Endpoint

**File**: `app/api/health/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('_test').select('*').limit(1);

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: error ? 'error' : 'connected'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Service unavailable' },
      { status: 500 }
    );
  }
}
```

### 1.6 Create Type Definitions

**File**: `types/index.ts`
```typescript
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface OnboardingPlan {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  repository_url: string;
  is_active: boolean;
  version: number;
}

export interface OnboardingStep {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  order_index: number;
  step_type: 'setup' | 'documentation' | 'task' | 'verification';
  content: {
    instructions: string;
    code?: string;
    commands?: string[];
    verificationSteps?: string[];
  };
  estimated_duration: number;
}
```

### ✅ Stage 1 Testing

**Start dev server**:
```bash
npm run dev
```

**Test**:
1. Visit http://localhost:3000 (should see Next.js page)
2. Visit http://localhost:3000/api/health (should see JSON response)

**Expected Output**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-26T...",
  "services": {
    "supabase": "connected"
  }
}
```

**Deliverable**: Working Next.js app with Supabase connection

---

## Stage 2: Database & Authentication

**Duration**: 2-3 hours
**Goal**: Database schema created, authentication working

### 2.1 Create Database Schema in Supabase

**Navigate to**: Supabase Dashboard → SQL Editor

**Run this SQL**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('admin', 'developer', 'viewer')) DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding plans table
CREATE TABLE onboarding_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding steps table
CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES onboarding_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  step_type TEXT CHECK (step_type IN ('setup', 'documentation', 'task', 'verification')),
  content JSONB DEFAULT '{}'::jsonb,
  dependencies UUID[] DEFAULT ARRAY[]::UUID[],
  estimated_duration INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES onboarding_plans(id),
  step_id UUID REFERENCES onboarding_steps(id),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  time_spent INTEGER DEFAULT 0,
  UNIQUE(user_id, plan_id, step_id)
);

-- Create indexes
CREATE INDEX idx_onboarding_steps_plan_id ON onboarding_steps(plan_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_plan_id ON user_progress(plan_id);

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Simple policies (we'll refine these later)
CREATE POLICY "Public read access" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public access" ON onboarding_plans FOR ALL USING (true);
CREATE POLICY "Public access" ON onboarding_steps FOR ALL USING (true);
CREATE POLICY "Public access" ON user_progress FOR ALL USING (true);
```

### 2.2 Set Up NextAuth.js

**File**: `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { supabaseAdmin } from "@/lib/supabase/server";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create user in Supabase if doesn't exist
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
          email: user.email!,
          name: user.name,
        })
        .select()
        .single();

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Fetch user from Supabase
        const { data } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (data) {
          session.user.id = data.id;
          session.user.organizationId = data.organization_id;
          session.user.role = data.role;
        }
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

### 2.3 Create Organizations API

**File**: `app/api/organizations/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

### ✅ Stage 2 Testing

**Test Database**:
1. Go to Supabase Dashboard → Table Editor
2. Verify tables exist: organizations, users, onboarding_plans, etc.

**Test API**:
```bash
# Create organization
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Company"}'

# Get organizations
curl http://localhost:3000/api/organizations
```

**Test Auth**:
1. Visit http://localhost:3000
2. Add a sign-in button (temporary)
3. Click sign in → should redirect to GitHub
4. After auth, check Supabase → users table for new entry

**Deliverable**: Database schema + working authentication + CRUD APIs

---

## Stage 3: Basic VS Code Extension

**Duration**: 4-5 hours
**Goal**: VS Code extension that loads and shows a TreeView

### 3.1 Initialize Extension Project

```bash
cd ../extension
npm install -g yo generator-code
yo code
```

**Selections**:
- Type: New Extension (TypeScript)
- Name: devonboard-ai
- Identifier: devonboard-ai
- Description: AI-powered developer onboarding
- Initialize git: No (already in repo)
- Package manager: npm

### 3.2 Install Dependencies

```bash
npm install axios
npm install socket.io-client
npm install @types/vscode
```

### 3.3 Extension Structure

```
extension/
├── src/
│   ├── extension.ts          # Entry point
│   ├── treeview.ts           # Checklist TreeView
│   ├── webview.ts            # Detail panel
│   ├── api.ts                # Backend API client
│   └── types.ts              # Type definitions
├── package.json
└── tsconfig.json
```

### 3.4 Create TreeView Provider

**File**: `src/treeview.ts`
```typescript
import * as vscode from 'vscode';

export interface OnboardingItem {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  description: string;
}

export class OnboardingTreeProvider implements vscode.TreeDataProvider<OnboardingTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<OnboardingTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private items: OnboardingItem[] = [];

  constructor() {
    // Sample data for now
    this.items = [
      { id: '1', title: 'Install Dependencies', status: 'completed', description: 'npm install' },
      { id: '2', title: 'Set up Database', status: 'in_progress', description: 'Configure PostgreSQL' },
      { id: '3', title: 'Run Dev Server', status: 'not_started', description: 'npm run dev' },
    ];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: OnboardingTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OnboardingTreeItem): Thenable<OnboardingTreeItem[]> {
    if (!element) {
      return Promise.resolve(
        this.items.map(item => new OnboardingTreeItem(item))
      );
    }
    return Promise.resolve([]);
  }
}

class OnboardingTreeItem extends vscode.TreeItem {
  constructor(public readonly item: OnboardingItem) {
    super(item.title, vscode.TreeItemCollapsibleState.None);

    this.description = item.status;
    this.tooltip = item.description;

    // Set icon based on status
    if (item.status === 'completed') {
      this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
    } else if (item.status === 'in_progress') {
      this.iconPath = new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('testing.iconQueued'));
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-outline');
    }

    this.command = {
      command: 'devonboard.showStepDetail',
      title: 'Show Details',
      arguments: [item]
    };
  }
}
```

### 3.5 Update Extension Entry Point

**File**: `src/extension.ts`
```typescript
import * as vscode from 'vscode';
import { OnboardingTreeProvider } from './treeview';

export function activate(context: vscode.ExtensionContext) {
  console.log('Devonboard AI extension activated!');

  // Create TreeView
  const treeDataProvider = new OnboardingTreeProvider();
  const treeView = vscode.window.createTreeView('devonboard-checklist', {
    treeDataProvider
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.refresh', () => {
      treeDataProvider.refresh();
      vscode.window.showInformationMessage('Onboarding checklist refreshed!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.showStepDetail', (item) => {
      vscode.window.showInformationMessage(`Step: ${item.title}\n${item.description}`);
    })
  );

  context.subscriptions.push(treeView);
}

export function deactivate() {}
```

### 3.6 Update package.json

**File**: `package.json` (add to existing)
```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "devonboard-sidebar",
          "title": "Devonboard AI",
          "icon": "resources/icon.svg"
        }
      ]
    },
    "views": {
      "devonboard-sidebar": [
        {
          "id": "devonboard-checklist",
          "name": "Onboarding Checklist"
        }
      ]
    },
    "commands": [
      {
        "command": "devonboard.refresh",
        "title": "Refresh Checklist",
        "icon": "$(refresh)"
      },
      {
        "command": "devonboard.showStepDetail",
        "title": "Show Step Details"
      }
    ],
    "menus": {
      "view/title": [
        {
          "command": "devonboard.refresh",
          "when": "view == devonboard-checklist",
          "group": "navigation"
        }
      ]
    }
  }
}
```

### ✅ Stage 3 Testing

**Run Extension**:
1. Open `extension/` folder in VS Code
2. Press `F5` (starts Extension Development Host)
3. In new window, look for Devonboard AI icon in Activity Bar
4. Click it → should see checklist with 3 items
5. Click refresh button → should show message
6. Click an item → should show details

**Expected**:
- ✅ Activity bar shows Devonboard icon
- ✅ Sidebar shows checklist with 3 sample items
- ✅ Icons show status (checkmark, spinner, circle)
- ✅ Clicking item shows details
- ✅ Refresh button works

**Deliverable**: Working VS Code extension with UI

---

## Stage 4: Claude Integration - Repository Analysis

**Duration**: 3-4 hours
**Goal**: Claude can analyze a GitHub repo and generate onboarding plan

### 4.1 Create Claude Client

**File**: `backend/lib/claude/client.ts`
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeRepository(repoUrl: string, readmeContent: string, packageJson: any) {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Analyze this repository and create an onboarding plan.

Repository: ${repoUrl}

README.md:
${readmeContent}

package.json:
${JSON.stringify(packageJson, null, 2)}

Generate a comprehensive onboarding plan with 5-10 steps.
Each step should include:
- title (short, actionable)
- description (detailed explanation)
- stepType (one of: setup, documentation, task, verification)
- content.instructions (markdown formatted)
- content.commands (array of commands to run, if applicable)
- estimatedDuration (in minutes)

Return ONLY a JSON array of steps, no other text.`
      }
    ]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    // Parse JSON from Claude's response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to parse Claude response');
}

export { client as claudeClient };
```

### 4.2 Create GitHub Helper (Using Composio)

**File**: `backend/lib/composio/github.ts`
```typescript
import { Composio } from 'composio-core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
});

export async function fetchRepositoryFiles(repoUrl: string) {
  // Extract owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');

  const [, owner, repo] = match;

  try {
    // Use Composio's GitHub integration to fetch files
    const readmeAction = await composio.execute({
      appName: 'github',
      action: 'get_file_content',
      params: {
        owner,
        repo,
        path: 'README.md'
      }
    });

    const packageJsonAction = await composio.execute({
      appName: 'github',
      action: 'get_file_content',
      params: {
        owner,
        repo,
        path: 'package.json'
      }
    });

    return {
      readme: readmeAction.data?.content || '',
      packageJson: JSON.parse(packageJsonAction.data?.content || '{}')
    };
  } catch (error) {
    console.error('Error fetching repo files:', error);
    throw error;
  }
}
```

### 4.3 Create Analysis API Endpoint

**File**: `backend/app/api/analyze-repo/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/claude/client';
import { fetchRepositoryFiles } from '@/lib/composio/github';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, organizationId } = await request.json();

    // Fetch repository files using Composio
    const { readme, packageJson } = await fetchRepositoryFiles(repoUrl);

    // Analyze with Claude
    const steps = await analyzeRepository(repoUrl, readme, packageJson);

    // Create onboarding plan in database
    const { data: plan, error: planError } = await supabaseAdmin
      .from('onboarding_plans')
      .insert({
        organization_id: organizationId,
        name: `Onboarding for ${repoUrl.split('/').pop()}`,
        description: 'Auto-generated onboarding plan',
        repository_url: repoUrl,
        is_active: true,
      })
      .select()
      .single();

    if (planError) throw planError;

    // Insert steps
    const stepsWithPlanId = steps.map((step: any, index: number) => ({
      plan_id: plan.id,
      title: step.title,
      description: step.description,
      order_index: index,
      step_type: step.stepType,
      content: {
        instructions: step.content?.instructions || step.description,
        commands: step.content?.commands || [],
      },
      estimated_duration: step.estimatedDuration || 30,
    }));

    const { error: stepsError } = await supabaseAdmin
      .from('onboarding_steps')
      .insert(stepsWithPlanId);

    if (stepsError) throw stepsError;

    return NextResponse.json({
      planId: plan.id,
      stepsCount: steps.length,
      steps
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### ✅ Stage 4 Testing

**Setup**:
1. Ensure Composio GitHub integration is connected:
   ```bash
   composio apps
   # Should show github as connected
   ```

**Test API**:
```bash
# First, create an organization and get its ID
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Org"}'
# Returns: {"id": "uuid-here", ...}

# Analyze a repository
curl -X POST http://localhost:3000/api/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/vercel/next.js",
    "organizationId": "uuid-from-above"
  }'
```

**Expected Response**:
```json
{
  "planId": "plan-uuid",
  "stepsCount": 7,
  "steps": [
    {
      "title": "Install Node.js and npm",
      "description": "...",
      "stepType": "setup",
      ...
    },
    ...
  ]
}
```

**Verify in Supabase**:
1. Go to Table Editor
2. Check `onboarding_plans` table → should see new plan
3. Check `onboarding_steps` table → should see 5-10 steps

**Deliverable**: Claude-powered repository analysis working

---

## Stage 5: Manual Onboarding Flow

**Duration**: 3-4 hours
**Goal**: Extension fetches real data from API and allows completing steps

### 5.1 Create API Client in Extension

**File**: `extension/src/api.ts`
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  step_type: string;
  content: {
    instructions: string;
    commands?: string[];
  };
  estimated_duration: number;
}

export class DevonboardAPI {
  private token?: string;

  setToken(token: string) {
    this.token = token;
  }

  async getOnboardingPlan(planId: string) {
    const response = await axios.get(`${API_URL}/onboarding/${planId}/steps`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  async updateProgress(stepId: string, status: string) {
    const response = await axios.post(
      `${API_URL}/progress`,
      { stepId, status },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.data;
  }
}

export const api = new DevonboardAPI();
```

### 5.2 Add API Endpoints for Steps

**File**: `backend/app/api/onboarding/[planId]/steps/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_steps')
      .select('*')
      .eq('plan_id', params.planId)
      .order('order_index');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 5.3 Update TreeView to Fetch Real Data

**File**: `extension/src/treeview.ts` (update)
```typescript
import * as vscode from 'vscode';
import { api, OnboardingStep } from './api';

export class OnboardingTreeProvider implements vscode.TreeDataProvider<OnboardingTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<OnboardingTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private steps: OnboardingStep[] = [];
  private planId?: string;

  constructor(private context: vscode.ExtensionContext) {}

  async loadPlan(planId: string) {
    this.planId = planId;
    await this.refresh();
  }

  async refresh(): Promise<void> {
    if (this.planId) {
      try {
        this.steps = await api.getOnboardingPlan(this.planId);
        this._onDidChangeTreeData.fire(undefined);
      } catch (error) {
        vscode.window.showErrorMessage('Failed to load onboarding plan');
      }
    }
  }

  getTreeItem(element: OnboardingTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OnboardingTreeItem): Thenable<OnboardingTreeItem[]> {
    if (!element) {
      return Promise.resolve(
        this.steps.map(step => new OnboardingTreeItem(step, this.context))
      );
    }
    return Promise.resolve([]);
  }
}

class OnboardingTreeItem extends vscode.TreeItem {
  constructor(
    public readonly step: OnboardingStep,
    private context: vscode.ExtensionContext
  ) {
    super(step.title, vscode.TreeItemCollapsibleState.None);

    this.description = `${step.estimated_duration}min`;
    this.tooltip = step.description;

    // Get status from local storage
    const status = this.getStatus();

    if (status === 'completed') {
      this.iconPath = new vscode.ThemeIcon('check');
    } else if (status === 'in_progress') {
      this.iconPath = new vscode.ThemeIcon('sync~spin');
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-outline');
    }

    this.command = {
      command: 'devonboard.showStepDetail',
      title: 'Show Details',
      arguments: [step]
    };
  }

  private getStatus(): string {
    const progress = this.context.globalState.get<Record<string, string>>('progress', {});
    return progress[this.step.id] || 'not_started';
  }
}
```

### 5.4 Create Webview for Step Details

**File**: `extension/src/webview.ts`
```typescript
import * as vscode from 'vscode';
import { OnboardingStep } from './api';

export class StepDetailPanel {
  public static currentPanel: StepDetailPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private context: vscode.ExtensionContext,
    private step: OnboardingStep
  ) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlContent();

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'markComplete':
            await this.markStepComplete();
            break;
          case 'markInProgress':
            await this.markStepInProgress();
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public static show(context: vscode.ExtensionContext, step: OnboardingStep) {
    const column = vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One;

    if (StepDetailPanel.currentPanel) {
      StepDetailPanel.currentPanel._panel.reveal(column);
      StepDetailPanel.currentPanel.step = step;
      StepDetailPanel.currentPanel._panel.webview.html = StepDetailPanel.currentPanel._getHtmlContent();
    } else {
      const panel = vscode.window.createWebviewPanel(
        'stepDetail',
        'Onboarding Step',
        column,
        {
          enableScripts: true,
        }
      );

      StepDetailPanel.currentPanel = new StepDetailPanel(panel, context, step);
    }
  }

  private async markStepComplete() {
    const progress = this.context.globalState.get<Record<string, string>>('progress', {});
    progress[this.step.id] = 'completed';
    await this.context.globalState.update('progress', progress);
    vscode.window.showInformationMessage(`✅ Step completed: ${this.step.title}`);
    vscode.commands.executeCommand('devonboard.refresh');
  }

  private async markStepInProgress() {
    const progress = this.context.globalState.get<Record<string, string>>('progress', {});
    progress[this.step.id] = 'in_progress';
    await this.context.globalState.update('progress', progress);
    vscode.commands.executeCommand('devonboard.refresh');
  }

  private _getHtmlContent(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
          }
          h1 { color: var(--vscode-textLink-foreground); }
          .commands {
            background: var(--vscode-textBlockQuote-background);
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
          }
          code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
          }
          button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin: 5px;
            cursor: pointer;
            border-radius: 4px;
          }
          button:hover {
            background: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <h1>${this.step.title}</h1>
        <p><strong>Type:</strong> ${this.step.step_type}</p>
        <p><strong>Estimated Duration:</strong> ${this.step.estimated_duration} minutes</p>

        <h2>Instructions</h2>
        <div>${this.step.content.instructions}</div>

        ${this.step.content.commands && this.step.content.commands.length > 0 ? `
          <h2>Commands to Run</h2>
          <div class="commands">
            ${this.step.content.commands.map(cmd => `<div><code>${cmd}</code></div>`).join('')}
          </div>
        ` : ''}

        <div style="margin-top: 20px;">
          <button onclick="markInProgress()">Start Step</button>
          <button onclick="markComplete()">Mark Complete</button>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          function markComplete() {
            vscode.postMessage({ command: 'markComplete' });
          }

          function markInProgress() {
            vscode.postMessage({ command: 'markInProgress' });
          }
        </script>
      </body>
      </html>
    `;
  }
}
```

### 5.5 Update Extension Entry Point

**File**: `extension/src/extension.ts` (update)
```typescript
import * as vscode from 'vscode';
import { OnboardingTreeProvider } from './treeview';
import { StepDetailPanel } from './webview';

export function activate(context: vscode.ExtensionContext) {
  console.log('Devonboard AI activated!');

  const treeDataProvider = new OnboardingTreeProvider(context);
  const treeView = vscode.window.createTreeView('devonboard-checklist', {
    treeDataProvider
  });

  // Load a plan (for testing, hardcode a plan ID)
  // TODO: Later, this will come from user selection
  const testPlanId = context.globalState.get<string>('currentPlanId');
  if (testPlanId) {
    treeDataProvider.loadPlan(testPlanId);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.setPlan', async () => {
      const planId = await vscode.window.showInputBox({
        prompt: 'Enter Onboarding Plan ID',
        placeHolder: 'Plan ID from database'
      });

      if (planId) {
        await context.globalState.update('currentPlanId', planId);
        await treeDataProvider.loadPlan(planId);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.refresh', () => {
      treeDataProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('devonboard.showStepDetail', (step) => {
      StepDetailPanel.show(context, step);
    })
  );

  context.subscriptions.push(treeView);
}

export function deactivate() {}
```

### ✅ Stage 5 Testing

**Setup**:
1. From Stage 4, get a plan ID from Supabase
2. In Extension Development Host, run command: "Devonboard: Set Plan"
3. Enter the plan ID

**Test Flow**:
1. Checklist should populate with real steps from database
2. Click a step → webview opens with details
3. Click "Start Step" → icon changes to spinner
4. Click "Mark Complete" → icon changes to checkmark
5. Refresh → state persists

**Expected**:
- ✅ Real data loads from API
- ✅ Step details display correctly
- ✅ Progress tracking works locally
- ✅ Icons update based on status

**Deliverable**: Full manual onboarding flow working

---

## Stage 6: Composio + GitHub Integration

**Duration**: 3-4 hours
**Goal**: Detect when GitHub README changes using Composio webhooks

**Tool Setup Required**: Composio webhook configuration

### 6.1 Set Up Composio Webhooks

**In terminal**:
```bash
# List available triggers for GitHub
composio triggers github

# Create a webhook for push events
composio triggers create github GITHUB_PUSH_EVENT \
  --webhook-url https://your-backend.vercel.app/api/webhooks/github
```

**For local development**, use ngrok:
```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start ngrok tunnel
ngrok http 3000

# Use the https URL for webhook
# Example: https://abc123.ngrok.io/api/webhooks/github
```

### 6.2 Create Documentation Sources Table

**Run in Supabase SQL Editor**:
```sql
CREATE TABLE documentation_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  plan_id UUID REFERENCES onboarding_plans(id),
  source_type TEXT CHECK (source_type IN ('github', 'notion', 'confluence')),
  source_url TEXT NOT NULL,
  file_paths TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which files to watch
  last_synced_at TIMESTAMP,
  last_content_hash TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES documentation_sources(id),
  detected_at TIMESTAMP DEFAULT NOW(),
  change_type TEXT CHECK (change_type IN ('added', 'modified', 'deleted')),
  file_path TEXT,
  old_content TEXT,
  new_content TEXT,
  change_summary TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP
);

CREATE INDEX idx_change_log_source_id ON change_log(source_id);
CREATE INDEX idx_change_log_processed ON change_log(processed);
```

### 6.3 Create Webhook Handler

**File**: `backend/app/api/webhooks/github/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Composio } from 'composio-core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log('GitHub webhook received:', payload);

    // Composio sends standardized webhook payload
    const { event, data } = payload;

    if (event === 'push') {
      // Check if any watched files were modified
      const commits = data.commits || [];

      for (const commit of commits) {
        const modifiedFiles = [
          ...(commit.added || []),
          ...(commit.modified || []),
        ];

        // Filter for documentation files
        const docFiles = modifiedFiles.filter((file: string) =>
          file.endsWith('.md') ||
          file.includes('docs/') ||
          file === 'README.md'
        );

        if (docFiles.length > 0) {
          await handleDocumentationChange({
            repository: data.repository.full_name,
            files: docFiles,
            commit: commit.id,
            message: commit.message,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleDocumentationChange(change: any) {
  // Find documentation source for this repository
  const { data: sources } = await supabaseAdmin
    .from('documentation_sources')
    .select('*')
    .eq('source_type', 'github')
    .ilike('source_url', `%${change.repository}%`)
    .eq('is_active', true);

  if (!sources || sources.length === 0) {
    console.log('No active sources found for repository:', change.repository);
    return;
  }

  for (const source of sources) {
    // Fetch new content
    for (const file of change.files) {
      const newContent = await fetchFileContent(change.repository, file);

      // Log the change
      await supabaseAdmin.from('change_log').insert({
        source_id: source.id,
        change_type: 'modified',
        file_path: file,
        new_content: newContent,
        change_summary: change.message,
        processed: false,
      });
    }
  }

  console.log('Documentation change logged:', change);
}

async function fetchFileContent(repository: string, path: string): Promise<string> {
  const [owner, repo] = repository.split('/');

  try {
    const result = await composio.execute({
      appName: 'github',
      action: 'get_file_content',
      params: { owner, repo, path }
    });

    return result.data?.content || '';
  } catch (error) {
    console.error('Error fetching file:', error);
    return '';
  }
}
```

### 6.4 Create API to Register Documentation Sources

**File**: `backend/app/api/documentation-sources/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { organizationId, planId, sourceType, sourceUrl, filePaths } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('documentation_sources')
      .insert({
        organization_id: organizationId,
        plan_id: planId,
        source_type: sourceType,
        source_url: sourceUrl,
        file_paths: filePaths || ['README.md', 'docs/**/*.md'],
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const planId = searchParams.get('planId');

  const query = supabaseAdmin
    .from('documentation_sources')
    .select('*');

  if (planId) {
    query.eq('plan_id', planId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### ✅ Stage 6 Testing

**Setup Webhook**:
```bash
# Start ngrok
ngrok http 3000

# Note the https URL, e.g., https://abc123.ngrok.io

# Configure Composio webhook
composio triggers create github GITHUB_PUSH_EVENT \
  --webhook-url https://abc123.ngrok.io/api/webhooks/github
```

**Register a Documentation Source**:
```bash
curl -X POST http://localhost:3000/api/documentation-sources \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "your-org-id",
    "planId": "your-plan-id",
    "sourceType": "github",
    "sourceUrl": "https://github.com/your-username/test-repo",
    "filePaths": ["README.md"]
  }'
```

**Trigger a Change**:
1. Edit README.md in the watched GitHub repository
2. Commit and push the change
3. Check backend logs → should see "GitHub webhook received"
4. Check Supabase `change_log` table → should see new entry

**Expected**:
- ✅ Webhook receives GitHub push events
- ✅ Documentation file changes are detected
- ✅ Changes logged in `change_log` table
- ✅ Content is fetched and stored

**Deliverable**: GitHub change detection working

---

## Stage 7: Auto-Sync Engine (The Showcase Feature!)

**Duration**: 4-5 hours
**Goal**: When docs change, Claude analyzes impact and updates onboarding

### 7.1 Create Change Processing Worker

**File**: `backend/lib/workers/process-changes.ts`
```typescript
import { supabaseAdmin } from '../supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function processUnprocessedChanges() {
  // Get unprocessed changes
  const { data: changes } = await supabaseAdmin
    .from('change_log')
    .select('*, documentation_sources(*)')
    .eq('processed', false)
    .limit(10);

  if (!changes || changes.length === 0) {
    console.log('No unprocessed changes');
    return;
  }

  for (const change of changes) {
    try {
      await processChange(change);
    } catch (error) {
      console.error('Error processing change:', error);
    }
  }
}

async function processChange(change: any) {
  console.log('Processing change:', change.id);

  const source = change.documentation_sources;
  const planId = source.plan_id;

  // Get current onboarding steps
  const { data: steps } = await supabaseAdmin
    .from('onboarding_steps')
    .select('*')
    .eq('plan_id', planId)
    .order('order_index');

  if (!steps) return;

  // Analyze change with Claude
  const analysis = await analyzeChangeImpact(
    change.old_content || '',
    change.new_content || '',
    steps
  );

  // Update affected steps
  for (const update of analysis.updates) {
    await supabaseAdmin
      .from('onboarding_steps')
      .update({
        content: update.newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', update.stepId);
  }

  // Mark as processed
  await supabaseAdmin
    .from('change_log')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      change_summary: analysis.summary
    })
    .eq('id', change.id);

  console.log(`Processed change ${change.id}: ${analysis.updates.length} steps updated`);
}

async function analyzeChangeImpact(oldContent: string, newContent: string, steps: any[]) {
  const message = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Analyze this documentation change and determine which onboarding steps need to be updated.

OLD CONTENT:
${oldContent.substring(0, 3000)}

NEW CONTENT:
${newContent.substring(0, 3000)}

CURRENT ONBOARDING STEPS:
${JSON.stringify(steps.map(s => ({ id: s.id, title: s.title, content: s.content })), null, 2)}

For each step that needs updating:
1. Identify what changed in the documentation
2. Determine if it affects this step
3. If yes, provide the updated content

Return JSON in this format:
{
  "summary": "Brief summary of changes",
  "updates": [
    {
      "stepId": "uuid",
      "reason": "Why this step needs updating",
      "newContent": {
        "instructions": "Updated instructions...",
        "commands": ["updated", "commands"]
      }
    }
  ]
}

If no steps need updating, return empty updates array.`
      }
    ]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  return { summary: 'No changes detected', updates: [] };
}
```

### 7.2 Create API Endpoint to Trigger Processing

**File**: `backend/app/api/process-changes/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processUnprocessedChanges } from '@/lib/workers/process-changes';

export async function POST(request: NextRequest) {
  try {
    await processUnprocessedChanges();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 7.3 Add Automatic Processing to Webhook

**File**: `backend/app/api/webhooks/github/route.ts` (update)
```typescript
// Add to the end of handleDocumentationChange function:

import { processUnprocessedChanges } from '@/lib/workers/process-changes';

async function handleDocumentationChange(change: any) {
  // ... existing code ...

  // Trigger processing immediately
  setTimeout(() => {
    processUnprocessedChanges().catch(console.error);
  }, 1000); // Small delay to ensure data is committed
}
```

### 7.4 Create Real-time Notification System

**File**: `backend/lib/realtime/notifier.ts`
```typescript
import { supabaseAdmin } from '../supabase/server';

export async function notifyStepUpdate(planId: string, stepId: string) {
  // In a real app, you'd use WebSockets or Supabase Realtime
  // For now, we'll create a notification record

  await supabaseAdmin.from('notifications').insert({
    plan_id: planId,
    message: `Onboarding step updated`,
    type: 'step_updated',
    data: { stepId },
    created_at: new Date().toISOString()
  });
}
```

### ✅ Stage 7 Testing

**Complete Flow Test**:

1. **Set up monitoring**:
   ```bash
   # Create a documentation source (from Stage 6)
   curl -X POST http://localhost:3000/api/documentation-sources \
     -H "Content-Type: application/json" \
     -d '{
       "organizationId": "...",
       "planId": "...",
       "sourceType": "github",
       "sourceUrl": "https://github.com/your/repo"
     }'
   ```

2. **Edit README.md in the repository**:
   - Change installation instructions
   - Add new requirements
   - Update configuration steps
   - Commit and push

3. **Watch the magic happen**:
   ```bash
   # Check change log
   # In Supabase, query: SELECT * FROM change_log ORDER BY detected_at DESC;

   # Trigger processing manually
   curl -X POST http://localhost:3000/api/process-changes

   # Check updated steps
   # In Supabase, query: SELECT * FROM onboarding_steps WHERE updated_at > NOW() - INTERVAL '5 minutes';
   ```

4. **Verify in VS Code extension**:
   - Refresh checklist
   - Click updated step
   - See new content

**Expected Results**:
- ✅ GitHub README change detected within seconds
- ✅ Change logged in database
- ✅ Claude analyzes impact (check logs)
- ✅ Affected steps automatically updated
- ✅ Extension shows updated content

**Deliverable**: Full auto-sync pipeline working end-to-end! 🎉

---

## Stage 8: Web Dashboard

**Duration**: 4-5 hours
**Goal**: Admin can manage organizations, view analytics

### 8.1 Create Dashboard Pages

**File**: `backend/app/dashboard/page.tsx`
```typescript
import { supabaseAdmin } from '@/lib/supabase/server';
import { OrganizationList } from '@/components/OrganizationList';

export default async function DashboardPage() {
  const { data: organizations } = await supabaseAdmin
    .from('organizations')
    .select('*, onboarding_plans(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Devonboard AI Dashboard</h1>
      <OrganizationList organizations={organizations || []} />
    </div>
  );
}
```

**File**: `backend/components/OrganizationList.tsx`
```typescript
'use client';

import Link from 'next/link';

export function OrganizationList({ organizations }: any) {
  return (
    <div className="grid gap-4">
      {organizations.map((org: any) => (
        <div key={org.id} className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold">{org.name}</h2>
          <p className="text-gray-600">Slug: {org.slug}</p>
          <Link
            href={`/dashboard/${org.id}`}
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
}
```

### 8.2 Organization Detail Page

**File**: `backend/app/dashboard/[orgId]/page.tsx`
```typescript
import { supabaseAdmin } from '@/lib/supabase/server';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { OnboardingPlanManager } from '@/components/OnboardingPlanManager';

export default async function OrganizationPage({
  params
}: {
  params: { orgId: string }
}) {
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', params.orgId)
    .single();

  const { data: plans } = await supabaseAdmin
    .from('onboarding_plans')
    .select('*, onboarding_steps(count)')
    .eq('organization_id', params.orgId);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{org?.name}</h1>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Onboarding Plans</h2>
          <OnboardingPlanManager plans={plans || []} orgId={params.orgId} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <AnalyticsChart orgId={params.orgId} />
        </div>
      </div>
    </div>
  );
}
```

### ✅ Stage 8 Testing

1. Visit http://localhost:3000/dashboard
2. Should see list of organizations
3. Click an organization
4. Should see onboarding plans and analytics

**Deliverable**: Basic web dashboard for admins

---

## Stage 9: CodeRabbit MCP Integration

**Duration**: 2-3 hours
**Goal**: Code explanations and context in VS Code

### 9.1 Install CodeRabbit MCP Server

```bash
cd extension
npm install @modelcontextprotocol/sdk
```

### 9.2 Configure MCP

**File**: `extension/mcp-config.json`
```json
{
  "mcpServers": {
    "coderabbit": {
      "command": "npx",
      "args": ["-y", "@coderabbit/mcp-server"],
      "env": {
        "CODERABBIT_API_KEY": "${CODERABBIT_API_KEY}"
      }
    }
  }
}
```

### 9.3 Add Code Context Provider

**File**: `extension/src/code-context.ts`
```typescript
import * as vscode from 'vscode';

export class CodeContextProvider {
  async getExplanation(code: string, language: string): Promise<string> {
    // Integrate with CodeRabbit MCP
    // For now, return placeholder
    return `Explanation for ${language} code:\n${code}`;
  }

  registerHoverProvider() {
    return vscode.languages.registerHoverProvider('*', {
      async provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position);
        const word = document.getText(range);

        return new vscode.Hover(`Code context for: ${word}`);
      }
    });
  }
}
```

### ✅ Stage 9 Testing

- Hover over code → see context tooltip
- Right-click → "Explain this code"

**Deliverable**: Code context working in IDE

---

## Stage 10: Polish & Production

**Duration**: 3-4 hours
**Goal**: Production-ready application

### 10.1 Error Handling

- Add try-catch blocks everywhere
- User-friendly error messages
- Fallback UI states

### 10.2 Loading States

- Skeleton screens
- Progress indicators
- Optimistic updates

### 10.3 Testing

- Test all user flows end-to-end
- Test error scenarios
- Test with real repositories

### 10.4 Deployment

```bash
# Deploy backend to Vercel
vercel deploy

# Package extension
cd extension
vsce package
# Generates .vsix file for testing
```

### 10.5 Documentation

- Update README.md
- Add demo video
- Write setup guide

### ✅ Stage 10 Testing

**End-to-end demo**:
1. Create organization
2. Analyze repository
3. View onboarding in extension
4. Edit GitHub README
5. Watch auto-sync happen
6. Mark steps complete
7. View analytics in dashboard

**Deliverable**: Production-ready Devonboard AI! 🚀

---

## 📦 Final Deliverables Checklist

- [ ] Backend API deployed and running
- [ ] Database schema deployed to Supabase
- [ ] VS Code extension packaged as .vsix
- [ ] Web dashboard accessible
- [ ] Claude integration working
- [ ] Composio GitHub integration working
- [ ] Auto-sync pipeline functional
- [ ] Documentation complete
- [ ] Demo video recorded
- [ ] README.md with setup instructions

---

## 🎬 Demo Script

**1-minute version**:
1. "Meet Sarah, a new developer" (open VS Code)
2. "Devonboard gives her a personalized checklist" (show extension)
3. "Generated by AI from the repository" (show Claude analysis)
4. "When docs change..." (edit README on GitHub)
5. "...onboarding updates automatically" (show auto-sync)
6. "Sarah's always up to date" (refresh extension)

**5-minute version**: See implementation_plan.md

---

## 💡 Tips for Success

1. **Test after each stage** - Don't move forward with broken features
2. **Use git commits** - Commit after each stage completion
3. **Keep .env updated** - Document all API keys
4. **Watch the logs** - Console logs are your friend
5. **Start simple** - Use hardcoded IDs before building full flows
6. **Supabase UI is helpful** - Use Table Editor to inspect data
7. **ngrok for webhooks** - Essential for local webhook testing
8. **Claude is forgiving** - Prompts don't need to be perfect

Good luck building! 🎉
