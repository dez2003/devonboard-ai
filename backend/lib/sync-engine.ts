import { createClient } from '@/lib/supabase/server';
import { ChangeAnalyzer } from '@/lib/claude/change-analyzer';
import { Octokit } from '@octokit/rest';
import { OnboardingStep } from '@/types';

/**
 * Auto-Sync Engine
 * Orchestrates documentation change detection and onboarding step updates
 */

const analyzer = new ChangeAnalyzer();

/**
 * Main sync function: processes a documentation change from GitHub
 */
export async function syncDocumentationChange(
  repoUrl: string,
  filePath: string,
  commitId: string
): Promise<void> {
  console.log(`\n[SyncEngine] 🔄 Processing change:`);
  console.log(`  Repo: ${repoUrl}`);
  console.log(`  File: ${filePath}`);
  console.log(`  Commit: ${commitId}\n`);

  try {
    // Step 1: Find organizations/plans tracking this repository
    const supabase = createClient();

    const { data: sources, error: sourcesError } = await supabase
      .from('documentation_sources')
      .select(`
        *,
        onboarding_plans (
          id,
          name,
          organization_id
        )
      `)
      .eq('source_url', repoUrl)
      .eq('source_type', 'github')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('[SyncEngine] Error fetching sources:', sourcesError);
      return;
    }

    if (!sources || sources.length === 0) {
      console.log('[SyncEngine] ℹ️  No active plans tracking this repository');
      return;
    }

    console.log(`[SyncEngine] 📋 Found ${sources.length} plan(s) tracking this repo\n`);

    // Step 2: Fetch file contents (old and new)
    const { oldContent, newContent } = await fetchFileContents(
      repoUrl,
      filePath,
      commitId
    );

    if (!newContent) {
      console.log('[SyncEngine] ⚠️  Could not fetch file content');
      return;
    }

    // Step 3: Process each plan
    for (const source of sources) {
      await processSourceUpdate(
        source,
        filePath,
        oldContent,
        newContent,
        commitId
      );
    }

    console.log('[SyncEngine] ✅ Sync complete\n');
  } catch (error) {
    console.error('[SyncEngine] ❌ Sync failed:', error);
    throw error;
  }
}

/**
 * Process update for a single documentation source
 */
async function processSourceUpdate(
  source: any,
  filePath: string,
  oldContent: string,
  newContent: string,
  commitId: string
): Promise<void> {
  const planId = source.plan_id;
  const plan = (source as any).onboarding_plans;

  console.log(`[SyncEngine] 📦 Processing plan: "${plan.name}"`);

  const supabase = createClient();

  // Get current onboarding steps
  const { data: steps, error: stepsError } = await supabase
    .from('onboarding_steps')
    .select('*')
    .eq('plan_id', planId)
    .order('order_index');

  if (stepsError || !steps || steps.length === 0) {
    console.log('[SyncEngine]   No steps found for this plan');
    return;
  }

  console.log(`[SyncEngine]   Analyzing impact on ${steps.length} steps...`);

  // Analyze change with Claude
  const analysis = await analyzer.analyzeChange(
    filePath,
    oldContent,
    newContent,
    steps as OnboardingStep[]
  );

  console.log(`[SyncEngine]   Severity: ${analysis.severity}/10`);
  console.log(`[SyncEngine]   Affected steps: ${analysis.affectedStepTitles.length}`);
  console.log(`[SyncEngine]   Auto-update: ${analysis.shouldAutoUpdate ? 'YES' : 'NO'}\n`);

  // Find affected step IDs
  const affectedStepIds = steps
    .filter((s) => analysis.affectedStepTitles.includes(s.title))
    .map((s) => s.id);

  // Log the change
  const { error: logError } = await supabase.from('source_changes').insert({
    source_id: source.id,
    change_type: 'modified',
    old_content: oldContent,
    new_content: newContent,
    affected_steps: affectedStepIds,
    severity: analysis.severity,
    auto_applied: analysis.shouldAutoUpdate,
    diff: {
      file: filePath,
      commit: commitId,
      summary: analysis.summary,
    },
  });

  if (logError) {
    console.error('[SyncEngine]   ⚠️  Failed to log change:', logError);
  }

  // Auto-update steps if safe
  if (analysis.shouldAutoUpdate && analysis.severity < 7) {
    console.log(`[SyncEngine]   🔄 Auto-updating ${analysis.suggestedUpdates.length} step(s)...`);

    for (const update of analysis.suggestedUpdates) {
      const step = steps.find((s) => s.title === update.stepTitle);

      if (!step) {
        console.log(`[SyncEngine]     ⚠️  Step not found: "${update.stepTitle}"`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('onboarding_steps')
        .update({
          content: {
            ...step.content,
            instructions: update.newInstructions,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', step.id);

      if (updateError) {
        console.error(`[SyncEngine]     ❌ Failed to update "${step.title}":`, updateError);
      } else {
        console.log(`[SyncEngine]     ✅ Updated: "${step.title}"`);
        console.log(`[SyncEngine]        Reason: ${update.reason}`);
      }
    }

    // Mark change as processed
    await supabase
      .from('source_changes')
      .update({ processed_at: new Date().toISOString() })
      .eq('source_id', source.id)
      .is('processed_at', null)
      .order('detected_at', { ascending: false })
      .limit(1);
  } else {
    console.log(`[SyncEngine]   ⚠️  Manual review required (severity: ${analysis.severity})`);
    console.log(`[SyncEngine]   Summary: ${analysis.summary}`);
  }
}

/**
 * Fetch file contents from GitHub (old and new versions)
 */
async function fetchFileContents(
  repoUrl: string,
  filePath: string,
  commitId: string
): Promise<{ oldContent: string; newContent: string }> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const [owner, repo] = parseGitHubUrl(repoUrl);

  console.log(`[SyncEngine] 📥 Fetching file contents from GitHub...`);

  // Fetch new content
  let newContent = '';
  try {
    const { data: newFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: commitId,
    });

    if ('content' in newFile) {
      newContent = Buffer.from(newFile.content, 'base64').toString('utf-8');
    }
  } catch (error) {
    console.error('[SyncEngine]   ❌ Failed to fetch new content:', error);
  }

  // Fetch old content (parent commit)
  let oldContent = '';
  try {
    const { data: oldFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: `${commitId}^`, // Parent commit
    });

    if ('content' in oldFile) {
      oldContent = Buffer.from(oldFile.content, 'base64').toString('utf-8');
    }
  } catch (error) {
    // File might be new (no parent)
    console.log('[SyncEngine]   ℹ️  No previous version (new file)');
  }

  console.log(`[SyncEngine]   Old content: ${oldContent.length} bytes`);
  console.log(`[SyncEngine]   New content: ${newContent.length} bytes\n`);

  return { oldContent, newContent };
}

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url: string): [string, string] {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\.]+)/,
    /github\.com:([^\/]+)\/([^\/\.]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return [match[1], match[2].replace('.git', '')];
    }
  }

  throw new Error(`Invalid GitHub URL: ${url}`);
}
