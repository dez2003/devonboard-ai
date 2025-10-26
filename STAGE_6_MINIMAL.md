# Stage 6: Auto-Sync Engine (Minimal Implementation)

## 🎯 Goal

Build the **auto-sync showcase feature** with minimal code:
1. Detect when GitHub docs change
2. Analyze impact with Claude
3. Auto-update affected steps

**Time**: 3-4 hours
**Files to create**: 3 core files
**External setup**: 15 minutes

---

## 🏗️ Minimal Architecture

```
GitHub Doc Changes
       ↓
   Webhook → /api/webhook/github
       ↓
   Change Analyzer (Claude)
       ↓
   Update Steps in Database
       ↓
   Notify Users (optional)
```

---

## 📦 What We Need (Minimal)

### 1. Composio Setup (15 min)

Instead of complex integrations, use **Composio's GitHub webhook** directly:

```bash
# Install Composio
npm install composio-core

# Connect GitHub
npx composio add github

# Set up webhook (Composio handles this automatically)
```

That's it! Composio manages:
- OAuth authentication
- Webhook registration
- Event forwarding to your API

### 2. Three Core Files

#### File 1: `backend/lib/claude/change-analyzer.ts` (100 lines)
Reuses existing `ClaudeClient`, adds change analysis method

#### File 2: `backend/app/api/webhook/github/route.ts` (150 lines)
Receives GitHub webhook events, triggers analysis

#### File 3: `backend/lib/sync-engine.ts` (100 lines)
Orchestrates the sync: fetch → analyze → update

**Total**: ~350 lines of new code

---

## 🔧 Implementation

### Step 1: Set Up Composio (15 min)

```bash
cd backend

# Install
npm install composio-core

# Login and connect GitHub
npx composio login
npx composio add github

# Configure webhook for your repo
npx composio triggers enable github_push
```

Add to `.env`:
```bash
COMPOSIO_API_KEY=your_key_here
```

### Step 2: Create Change Analyzer (30 min)

**File**: `backend/lib/claude/change-analyzer.ts`

```typescript
import { ClaudeClient } from './client';
import { OnboardingStep } from '@/types';

export class ChangeAnalyzer {
  private claude: ClaudeClient;

  constructor() {
    this.claude = new ClaudeClient();
  }

  /**
   * Analyze if a documentation change affects onboarding steps
   */
  async analyzeChange(
    filePath: string,
    oldContent: string,
    newContent: string,
    currentSteps: OnboardingStep[]
  ) {
    const prompt = `A documentation file changed. Analyze the impact:

FILE: ${filePath}

OLD CONTENT:
${oldContent.substring(0, 2000)}

NEW CONTENT:
${newContent.substring(0, 2000)}

CURRENT ONBOARDING STEPS:
${currentSteps.map(s => `- ${s.title}: ${s.content.instructions.substring(0, 100)}`).join('\n')}

Determine:
1. Change severity (1-10)
2. Which steps are affected (by title)
3. Should we auto-update? (yes/no)
4. Brief summary of changes

Return as JSON.`;

    const schema = `{
  "severity": number,
  "affectedStepTitles": ["string"],
  "shouldAutoUpdate": boolean,
  "summary": "string",
  "suggestedUpdates": [{
    "stepTitle": "string",
    "newInstructions": "string"
  }]
}`;

    return await this.claude.analyzeStructured(prompt, schema);
  }
}
```

### Step 3: Create Webhook Endpoint (45 min)

**File**: `backend/app/api/webhook/github/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { syncDocumentationChange } from '@/lib/sync-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // GitHub webhook event
    const event = request.headers.get('x-github-event');

    if (event === 'push') {
      // Extract changed files
      const commits = body.commits || [];

      for (const commit of commits) {
        const modified = commit.modified || [];
        const added = commit.added || [];
        const files = [...modified, ...added];

        // Filter for documentation files
        const docFiles = files.filter((f: string) =>
          f.endsWith('.md') ||
          f.includes('docs/') ||
          f.includes('README')
        );

        if (docFiles.length > 0) {
          // Trigger sync for each file
          for (const file of docFiles) {
            await syncDocumentationChange(
              body.repository.html_url,
              file,
              commit.id
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Verify webhook signature (optional but recommended)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'GitHub webhook endpoint ready'
  });
}
```

### Step 4: Create Sync Engine (45 min)

**File**: `backend/lib/sync-engine.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { ChangeAnalyzer } from '@/lib/claude/change-analyzer';
import { Octokit } from '@octokit/rest';

const analyzer = new ChangeAnalyzer();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function syncDocumentationChange(
  repoUrl: string,
  filePath: string,
  commitId: string
) {
  console.log(`[Sync] Processing: ${repoUrl} - ${filePath}`);

  // 1. Find which organization/plan tracks this repo
  const supabase = createClient();
  const { data: sources } = await supabase
    .from('documentation_sources')
    .select('*, onboarding_plans(*)')
    .eq('source_url', repoUrl)
    .eq('source_type', 'github');

  if (!sources || sources.length === 0) {
    console.log('[Sync] No plans tracking this repo');
    return;
  }

  // 2. Fetch old and new content
  const [owner, repo] = parseGitHubUrl(repoUrl);

  // Get new content
  const { data: newFile } = await octokit.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: commitId
  });

  const newContent = Buffer.from(
    (newFile as any).content,
    'base64'
  ).toString();

  // Get old content (parent commit)
  let oldContent = '';
  try {
    const { data: oldFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: `${commitId}^`
    });
    oldContent = Buffer.from(
      (oldFile as any).content,
      'base64'
    ).toString();
  } catch (e) {
    // File is new
  }

  // 3. For each plan, analyze impact
  for (const source of sources) {
    const planId = source.plan_id;

    // Get current steps
    const { data: steps } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('plan_id', planId);

    if (!steps) continue;

    // 4. Analyze with Claude
    const analysis = await analyzer.analyzeChange(
      filePath,
      oldContent,
      newContent,
      steps
    );

    console.log('[Sync] Analysis:', analysis);

    // 5. Log the change
    await supabase.from('source_changes').insert({
      source_id: source.id,
      change_type: 'modified',
      old_content: oldContent,
      new_content: newContent,
      affected_steps: steps
        .filter(s => analysis.affectedStepTitles.includes(s.title))
        .map(s => s.id),
      severity: analysis.severity,
      auto_applied: analysis.shouldAutoUpdate
    });

    // 6. Auto-update if safe
    if (analysis.shouldAutoUpdate && analysis.severity < 7) {
      for (const update of analysis.suggestedUpdates) {
        const step = steps.find(s => s.title === update.stepTitle);
        if (step) {
          await supabase
            .from('onboarding_steps')
            .update({
              content: {
                ...step.content,
                instructions: update.newInstructions
              }
            })
            .eq('id', step.id);

          console.log(`[Sync] Auto-updated: ${step.title}`);
        }
      }
    } else {
      console.log('[Sync] Manual review required');
    }
  }
}

function parseGitHubUrl(url: string): [string, string] {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  return [match![1], match![2].replace('.git', '')];
}
```

---

## 🧪 Testing

### Test 1: Manual Trigger (5 min)

```bash
# Start backend
npm run dev

# Trigger webhook manually
curl -X POST http://localhost:3000/api/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -d '{
    "commits": [{
      "id": "abc123",
      "modified": ["README.md"],
      "added": []
    }],
    "repository": {
      "html_url": "https://github.com/YOUR_USER/YOUR_REPO"
    }
  }'
```

### Test 2: Real GitHub Webhook (15 min)

1. **Create a test repo**:
   ```bash
   gh repo create devonboard-test --public
   cd devonboard-test
   echo "# Setup Guide" > README.md
   git add . && git commit -m "Initial"
   git push
   ```

2. **Add to Devonboard**:
   ```bash
   curl -X POST http://localhost:3000/api/sources \
     -H "Content-Type: application/json" \
     -d '{
       "organizationId": "YOUR_ORG_ID",
       "planId": "YOUR_PLAN_ID",
       "sourceType": "github",
       "sourceUrl": "https://github.com/YOUR_USER/devonboard-test",
       "sourceName": "Test Repo",
       "filePaths": ["README.md"]
     }'
   ```

3. **Make a change**:
   ```bash
   echo "## Step 1: Install Node.js" >> README.md
   git add . && git commit -m "Add setup step"
   git push
   ```

4. **Check logs**:
   ```bash
   # Should see:
   # [Sync] Processing: github.com/user/devonboard-test - README.md
   # [Sync] Analysis: { severity: 5, affectedStepTitles: [...] }
   # [Sync] Auto-updated: Install dependencies
   ```

### Test 3: Verify Database (2 min)

```sql
-- Check changes were logged
SELECT * FROM source_changes
ORDER BY detected_at DESC
LIMIT 5;

-- Check steps were updated
SELECT id, title, updated_at
FROM onboarding_steps
WHERE updated_at > NOW() - INTERVAL '1 hour';
```

---

## 🎉 That's It!

**3 files, ~350 lines of code, auto-sync working!**

### What It Does:

1. ✅ Detects GitHub documentation changes via webhook
2. ✅ Fetches old and new content
3. ✅ Analyzes impact with Claude
4. ✅ Auto-updates steps if safe (severity < 7)
5. ✅ Logs all changes for review

### What We Skipped (Can Add Later):

- ❌ Notion/Confluence integrations (focus on GitHub for demo)
- ❌ Complex UI for change review (just logs for now)
- ❌ Email notifications (simple console logs)
- ❌ Rollback mechanism (v2 feature)

---

## 📊 Demo Flow

```
1. Show existing onboarding steps in VS Code
   ↓
2. Edit README.md in GitHub (change setup instructions)
   ↓
3. Commit and push
   ↓
4. Webhook triggers in <1 second
   ↓
5. Claude analyzes in ~3 seconds
   ↓
6. Steps auto-update in database
   ↓
7. Refresh VS Code → see updated instructions!
   ↓
8. Show source_changes table with analysis
```

**Total demo time**: < 30 seconds
**Wow factor**: 🤯 Maximum

---

## ✅ Success Criteria

- [ ] Composio GitHub integration working
- [ ] Webhook receives GitHub push events
- [ ] Claude analyzes documentation changes
- [ ] Steps auto-update in database
- [ ] Can demo end-to-end in < 30 seconds

---

## 🚀 Next: Stage 7 (Optional Polish)

If time permits:
- Add change review UI
- Support Notion (similar pattern)
- Add email notifications
- Build rollback feature

**But Stage 6 alone is impressive enough for the demo!** 🎉
