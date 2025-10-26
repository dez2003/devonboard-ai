# Stage 5: Manual Onboarding Flow + Multi-Source Integration Prep

## 🎯 Overview

Stage 5 builds the **core onboarding experience** in the VS Code extension and prepares the architecture for **pulling content from multiple documentation sources** (Notion, Google Docs, Confluence, Slack, GitHub, etc.).

**Key Principle**: Companies already have onboarding docs scattered across tools. Devonboard AI **aggregates and synchronizes** them rather than requiring recreation.

---

## 🏗️ Architecture Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                        VS Code Extension                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Onboarding Dashboard                            │  │
│  │  • Current step + progress                                │  │
│  │  • Step instructions (aggregated from multiple sources)   │  │
│  │  • Quick actions + commands                               │  │
│  │  • Chat assistant                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Fetch steps + content
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Backend API                         │
│  • /api/onboarding/plans                                        │
│  • /api/onboarding/steps                                        │
│  • /api/onboarding/progress                                     │
│  • /api/sources (NEW: manage doc sources)                       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ onboarding_  │  │ onboarding_  │  │documentation_│          │
│  │ plans        │  │ steps        │  │ sources      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐                                               │
│  │ user_        │  Tracks progress                              │
│  │ progress     │  per user/step                                │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Stage 6: Auto-sync
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              External Documentation Sources                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐      │
│  │  Notion  │  │  Gdocs   │  │Confluence │  │  GitHub  │      │
│  └──────────┘  └──────────┘  └───────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐                                    │
│  │  Slack   │  │  Linear  │  (More sources...)                 │
│  └──────────┘  └──────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 What We're Building in Stage 5

### Part 1: Database Schema for Multi-Source Content (30 min)

Extend the database to track **where onboarding content comes from**:

```sql
-- documentation_sources table (already defined in types)
-- Tracks external documentation locations

CREATE TABLE documentation_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan_id UUID REFERENCES onboarding_plans(id),

  -- Source details
  source_type VARCHAR(50) NOT NULL, -- 'notion', 'gdocs', 'confluence', 'github', 'slack'
  source_url TEXT NOT NULL,
  source_name VARCHAR(255),

  -- What to pull from this source
  file_paths TEXT[], -- For GitHub: file paths, For Notion: page IDs, etc.
  filter_config JSONB, -- Source-specific filters/queries

  -- Sync status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP,
  last_content_hash VARCHAR(64), -- Detect changes
  sync_frequency VARCHAR(20) DEFAULT 'daily', -- 'realtime', 'hourly', 'daily'

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track which onboarding steps came from which sources
CREATE TABLE step_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES onboarding_steps(id),
  source_id UUID NOT NULL REFERENCES documentation_sources(id),

  -- Mapping details
  source_section VARCHAR(255), -- Section/heading in source doc
  original_content_url TEXT, -- Direct link to source

  created_at TIMESTAMP DEFAULT NOW()
);

-- Change detection and history
CREATE TABLE source_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES documentation_sources(id),

  detected_at TIMESTAMP DEFAULT NOW(),
  change_type VARCHAR(20), -- 'content', 'structure', 'deletion'

  old_content TEXT,
  new_content TEXT,
  diff JSONB, -- Structured diff

  -- Impact assessment
  affected_steps UUID[], -- Array of step IDs
  severity INT, -- 1-10
  auto_applied BOOLEAN DEFAULT false,

  processed_at TIMESTAMP
);
```

### Part 2: VS Code Extension Onboarding UI (2 hours)

Build the main onboarding interface:

**Files to create:**
- `extension/src/panels/OnboardingPanel.ts` - Main onboarding webview panel
- `extension/webview/onboarding.html` - HTML structure
- `extension/webview/onboarding.js` - Panel logic
- `extension/webview/onboarding.css` - Styling

**Features:**
- Step-by-step checklist
- Current step details with rich content
- Progress indicator
- Quick actions (mark complete, skip, ask for help)
- Links back to source documentation
- Chat assistant integration

### Part 3: Backend API for Onboarding Flow (1 hour)

**New endpoints:**

```typescript
// Get onboarding plan for organization
GET /api/onboarding/plans?orgId={id}

// Get all steps for a plan
GET /api/onboarding/plans/{planId}/steps

// Get user's progress
GET /api/onboarding/progress?userId={id}&planId={id}

// Update step progress
POST /api/onboarding/progress
{
  userId: string,
  stepId: string,
  status: 'in_progress' | 'completed' | 'skipped',
  timeSpent: number,
  notes?: string
}

// NEW: Manage documentation sources
GET /api/sources?orgId={id}
POST /api/sources
{
  organizationId: string,
  sourceType: 'notion' | 'gdocs' | 'confluence' | 'github' | 'slack',
  sourceUrl: string,
  filePaths: string[],
  filterConfig?: object
}
```

### Part 4: Source Documentation UI (1 hour)

Add UI in extension to show **where content comes from**:

```typescript
// In each step, show sources
{
  "step": {
    "title": "Set up PostgreSQL database",
    "content": {...},
    "sources": [
      {
        "type": "notion",
        "name": "Engineering Wiki",
        "url": "https://notion.so/page-id",
        "section": "Database Setup"
      },
      {
        "type": "github",
        "name": "API Repository README",
        "url": "https://github.com/company/api",
        "section": "README.md#setup"
      }
    ]
  }
}
```

**User can:**
- See which docs were used to create each step
- Click to open original documentation
- Report if content is out of sync

---

## 🎨 UI/UX Design

### Onboarding Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│  Devonboard AI - Onboarding                           × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Progress: 3 of 12 steps completed (25%)            │
│  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░]                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  CURRENT STEP                                          │
│  ✓ 1. Install Node.js 18+                  [15 min]   │
│  ✓ 2. Clone repository                     [5 min]    │
│  ✓ 3. Install dependencies                 [10 min]   │
│  → 4. Set up PostgreSQL database           [20 min] ◀  │
│    5. Configure environment variables       [10 min]   │
│    6. Run database migrations               [5 min]    │
│    ... 6 more steps                                    │
├─────────────────────────────────────────────────────────┤
│  STEP DETAILS                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📦 Set up PostgreSQL database                     │ │
│  │                                                   │ │
│  │ Install and configure PostgreSQL for local dev.  │ │
│  │                                                   │ │
│  │ Instructions:                                     │ │
│  │ 1. Install PostgreSQL 15+                        │ │
│  │    macOS: brew install postgresql@15             │ │
│  │    Linux: sudo apt install postgresql-15         │ │
│  │                                                   │ │
│  │ 2. Start the service:                            │ │
│  │    macOS: brew services start postgresql@15      │ │
│  │    Linux: sudo systemctl start postgresql        │ │
│  │                                                   │ │
│  │ 3. Create database:                              │ │
│  │    createdb myapp_development                    │ │
│  │                                                   │ │
│  │ Verification:                                     │ │
│  │ • psql --version → should show 15.x              │ │
│  │ • psql -l → should list your database            │ │
│  │                                                   │ │
│  │ 📚 Sources:                                       │ │
│  │ • Notion: Engineering Wiki > Database Setup      │ │
│  │ • GitHub: api/README.md#database                 │ │
│  │                                                   │ │
│  │ [Run Commands] [Copy to Terminal] [Ask Claude]   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [✓ Mark Complete] [⏭ Skip] [🔧 Troubleshoot]          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  💬 Need help? Ask Claude                              │
│  [Type your question...]                        [Send] │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Tasks

### Task 1: Extend Backend Types (15 min)

Add multi-source types to `backend/types/index.ts`:

```typescript
export interface DocumentationSource {
  id: string;
  organization_id: string;
  plan_id: string;
  source_type: 'notion' | 'gdocs' | 'confluence' | 'github' | 'slack' | 'linear';
  source_url: string;
  source_name?: string;
  file_paths: string[];
  filter_config?: Record<string, any>;
  is_active: boolean;
  last_synced_at?: string;
  sync_frequency: 'realtime' | 'hourly' | 'daily';
  created_at: string;
}

export interface StepSource {
  id: string;
  step_id: string;
  source_id: string;
  source_section?: string;
  original_content_url?: string;
}

export interface SourceChange {
  id: string;
  source_id: string;
  detected_at: string;
  change_type: 'content' | 'structure' | 'deletion';
  old_content?: string;
  new_content?: string;
  affected_steps: string[];
  severity: number;
  auto_applied: boolean;
}
```

### Task 2: Create Database Migration (15 min)

Create SQL migration file with the schema above.

### Task 3: Build VS Code Extension Panel (2 hours)

Create the onboarding panel webview with:
- Step list with progress
- Current step details
- Action buttons
- Source attribution
- Chat integration

### Task 4: Backend API Routes (1 hour)

Implement all onboarding flow endpoints.

### Task 5: Connect Extension to Backend (30 min)

Wire up the extension to fetch and update onboarding data.

### Task 6: Test Manual Onboarding Flow (30 min)

Test complete flow:
1. User opens extension
2. Sees their onboarding plan
3. Follows steps
4. Marks steps complete
5. Progress tracked in database

---

## 🎯 Success Criteria

Stage 5 is complete when:

- [ ] VS Code extension shows onboarding dashboard
- [ ] Users can view all onboarding steps
- [ ] Users can mark steps as complete/in-progress/skipped
- [ ] Progress is persisted to database
- [ ] Each step shows its source documentation
- [ ] Users can click through to original docs
- [ ] API endpoints handle CRUD operations
- [ ] UI is responsive and intuitive

**Bonus (if time):**
- [ ] Timer tracking for each step
- [ ] Keyboard shortcuts
- [ ] Search/filter steps
- [ ] Export progress report

---

## 🔮 Preparing for Stage 6

Stage 5 sets up the **architecture for multi-source integration**:

- ✅ Database schema supports multiple doc sources
- ✅ UI shows source attribution
- ✅ API ready for source management
- ⏳ Stage 6 will add **automatic syncing** with:
  - Composio integrations
  - Webhooks for real-time updates
  - Claude-powered change detection
  - Automatic step regeneration

---

## 📚 Key Integrations (Coming in Stage 6)

### Supported Documentation Sources

1. **Notion** - Team wikis, onboarding pages
2. **Google Docs** - Shared documentation
3. **Confluence** - Enterprise wikis
4. **GitHub** - README, wiki, markdown files
5. **Slack** - Pinned messages, channel guides
6. **Linear** - Project context, best practices

### How It Works

```
1. Admin adds documentation source:
   "Pull from Notion page: Engineering Onboarding"

2. Claude analyzes the content:
   - Extracts setup steps
   - Identifies prerequisites
   - Generates verification commands

3. Steps are created/updated:
   - Linked back to source
   - Marked with source attribution

4. When source changes:
   - Webhook detected (Composio)
   - Claude analyzes impact
   - Steps auto-update if needed
   - Users notified of changes
```

---

## 💡 Key Differentiator

**Most onboarding tools require recreating content.**

**Devonboard AI aggregates existing documentation** → No duplicate work, always in sync.

```
Traditional:
  Company docs (Notion) → Manually copy → Onboarding tool
                              ↓
                          Out of sync quickly

Devonboard AI:
  Company docs (Notion) ←→ AI sync ←→ Onboarding experience
                              ↓
                          Always in sync
```

Let's build it! 🚀
