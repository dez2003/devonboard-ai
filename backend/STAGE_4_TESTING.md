# Stage 4: Claude Integration - Testing Guide

This guide will help you test the Repository Analyzer and Content Generator agents you just built.

## Prerequisites

Before testing, you need:

1. **Anthropic API Key** (Required)
2. **GitHub Token** (Optional but recommended)

---

## Step 1: Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd /Users/desirees/Desktop/devonboard-ai/backend
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```bash
# Required: Get from https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Optional but recommended: Get from https://github.com/settings/tokens
# Create a token with 'repo' read access
GITHUB_TOKEN=ghp_your_actual_token_here
```

---

## Step 2: Test with CLI Script

Test the repository analyzer with a real GitHub repo:

### Option 1: Test with a small public repo

```bash
npm run test:analyze https://github.com/vercel/next.js
```

### Option 2: Test with your own repo

```bash
npm run test:analyze https://github.com/YOUR_USERNAME/YOUR_REPO
```

### Expected Output

You should see:

```
🔍 Devonboard AI - Repository Analysis Test

============================================================
Repository: https://github.com/vercel/next.js
============================================================

📊 Step 1: Analyzing repository structure...

✅ Repository analysis complete! (3.5s)

============================================================
📋 ANALYSIS RESULTS
============================================================

🔧 Tech Stack:
  Languages: TypeScript, JavaScript
  Frameworks: Next.js, React
  Tools: npm, Docker

🏗️  Project Structure:
  Type: monorepo
  Main Directories: packages, examples, docs
  Entry Points: packages/next/src/server/next.ts

⚙️  Setup Requirements:
  Environment: Node.js 18+, npm 7+
  Services: None
  Credentials: None

============================================================
📝 Step 2: Generating onboarding plan...

✅ Onboarding plan generated! (4.2s)

============================================================
📚 ONBOARDING STEPS
============================================================

1. Install Node.js and npm
   Type: setup
   Duration: 15 minutes
   Description: Install required Node.js runtime...
   Commands: node --version, npm --version

2. Clone the repository
   Type: setup
   Duration: 5 minutes
   Commands: git clone https://github.com/vercel/next.js...

... (more steps)

============================================================
📊 SUMMARY
============================================================
Total Analysis Time: 7.8s
Steps Generated: 12
Estimated Onboarding Duration: 120 minutes (~2.0 hours)

Estimated API Cost: $0.0045

✅ Test completed successfully!

💾 Full results saved to: ./analysis-result-1234567890.json
```

---

## Step 3: Test via API Endpoint

Start the dev server:

```bash
npm run dev
```

Test the API endpoint with curl:

```bash
# Test basic analysis (without generating steps)
curl -X POST http://localhost:3000/api/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/vercel/next.js",
    "generateSteps": false
  }'

# Test full analysis with onboarding steps
curl -X POST http://localhost:3000/api/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/vercel/next.js",
    "generateSteps": true,
    "organizationContext": {
      "name": "My Company",
      "targetAudience": "Junior developers"
    }
  }'

# Test GET endpoint (quick analysis)
curl "http://localhost:3000/api/analyze-repo?url=https://github.com/vercel/next.js"
```

---

## Step 4: Verify Results

### Check Analysis Quality

The analysis should include:

✅ **Tech Stack**: Correctly identified languages, frameworks, tools
✅ **Project Structure**: Accurate directory structure and entry points
✅ **Setup Requirements**: Realistic list of environment needs
✅ **Onboarding Steps**: 8-15 logical, actionable steps

### Example Good Analysis

```json
{
  "success": true,
  "data": {
    "analysis": {
      "techStack": {
        "languages": ["TypeScript", "JavaScript"],
        "frameworks": ["Next.js", "React"],
        "tools": ["npm", "Docker", "Jest"]
      },
      "structure": {
        "type": "monorepo",
        "mainDirectories": ["packages", "examples", "docs"],
        "entryPoints": ["packages/next/src/server/next.ts"]
      },
      "setupRequirements": {
        "environment": ["Node.js 18+", "npm 7+"],
        "services": [],
        "credentials": []
      }
    },
    "onboardingSteps": [
      {
        "title": "Install Node.js 18+",
        "step_type": "setup",
        "content": {
          "instructions": "Download and install Node.js...",
          "commands": ["node --version", "npm --version"],
          "verificationSteps": ["Check version is 18 or higher"]
        },
        "estimated_duration": 15
      }
      // ... more steps
    ],
    "metadata": {
      "analyzedAt": "2024-01-15T10:30:00.000Z",
      "stepsGenerated": 12
    }
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "ANTHROPIC_API_KEY not found"

**Solution**: Make sure you created a `.env` file with your API key:

```bash
cd backend
echo "ANTHROPIC_API_KEY=sk-ant-api03-your-key-here" > .env
```

### Issue 2: "GitHub API rate limit exceeded"

**Solution**: Add a GitHub token to your `.env`:

```bash
# Get token from: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_your_token_here
```

### Issue 3: "Repository not found"

**Solution**:
- Check the URL format is correct: `https://github.com/owner/repo`
- Make sure the repository is public, or add a GitHub token with access

### Issue 4: "Claude response was not valid JSON"

**Solution**: This is usually a temporary Claude API issue. Try:
1. Run the test again
2. Try a different repository
3. Check your API key is valid

---

## Performance Benchmarks

Expected timing for different repo sizes:

| Repository Size | Analysis Time | Generation Time | Total Time |
|----------------|---------------|-----------------|------------|
| Small (<100 files) | 2-4s | 3-5s | 5-9s |
| Medium (100-500 files) | 4-7s | 5-8s | 9-15s |
| Large (500+ files) | 7-12s | 8-12s | 15-24s |

**Cost Estimates**:
- Small repo: $0.002-0.005
- Medium repo: $0.005-0.01
- Large repo: $0.01-0.02

---

## Next Steps

Once testing is successful:

1. ✅ Repository Analyzer works
2. ✅ Content Generator creates quality steps
3. ✅ API endpoint responds correctly

You're ready to move to **Stage 5: Manual Onboarding Flow**!

---

## Troubleshooting Tips

### Enable Debug Logging

Add to your `.env`:

```bash
DEBUG=true
```

### Test with Known-Good Repos

Try these repositories for testing:

- **Simple**: https://github.com/sindresorhus/is
- **Medium**: https://github.com/trpc/trpc
- **Complex**: https://github.com/vercel/next.js

### Check API Usage

Monitor your usage at:
- Anthropic: https://console.anthropic.com/settings/usage
- GitHub: https://github.com/settings/tokens (check rate limits)

---

## Success Criteria

Stage 4 is complete when:

- [ ] Repository analyzer successfully analyzes a real repo
- [ ] Content generator creates 8-15 logical steps
- [ ] API endpoint returns valid JSON
- [ ] Analysis accuracy > 85%
- [ ] Response time < 15 seconds
- [ ] No API errors

**If all checks pass, you're ready for Stage 5!** 🎉
