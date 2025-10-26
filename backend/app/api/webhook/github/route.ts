import { NextRequest, NextResponse } from 'next/server';
import { syncDocumentationChange } from '@/lib/sync-engine';
import { getChangeAnalyzer } from '@/lib/claude/change-analyzer';

/**
 * POST /api/webhook/github
 *
 * Receives GitHub webhook events (push, pull_request, etc.)
 * Triggers auto-sync when documentation files change
 *
 * Setup:
 * 1. In GitHub repo → Settings → Webhooks → Add webhook
 * 2. Payload URL: https://your-domain.com/api/webhook/github
 * 3. Content type: application/json
 * 4. Events: Just the push event (or choose specific events)
 * 5. Active: ✓
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = request.headers.get('x-github-event');

    console.log(`\n[Webhook] 📨 Received GitHub event: ${event}`);

    // Handle different GitHub events
    switch (event) {
      case 'push':
        await handlePushEvent(body);
        break;

      case 'ping':
        console.log('[Webhook] 🏓 Ping received - webhook is configured correctly');
        return NextResponse.json({
          success: true,
          message: 'Pong! Webhook is working.',
        });

      default:
        console.log(`[Webhook] ℹ️  Ignoring event type: ${event}`);
        return NextResponse.json({
          success: true,
          message: `Event ${event} received but not processed`,
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error: any) {
    console.error('[Webhook] ❌ Error processing webhook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GitHub push events
 */
async function handlePushEvent(body: any): Promise<void> {
  const repoUrl = body.repository?.html_url;
  const commits = body.commits || [];
  const ref = body.ref; // e.g., refs/heads/main

  console.log(`[Webhook] 📦 Repository: ${repoUrl}`);
  console.log(`[Webhook] 🌿 Branch: ${ref}`);
  console.log(`[Webhook] 📝 Commits: ${commits.length}\n`);

  if (!repoUrl) {
    console.log('[Webhook] ⚠️  No repository URL in payload');
    return;
  }

  const analyzer = getChangeAnalyzer();

  // Process each commit
  for (const commit of commits) {
    const commitId = commit.id;
    const commitMessage = commit.message;

    console.log(`[Webhook] 🔍 Commit ${commitId.substring(0, 7)}: ${commitMessage}`);

    // Get all modified, added, and removed files
    const modified = commit.modified || [];
    const added = commit.added || [];
    const removed = commit.removed || [];

    const allChangedFiles = [...modified, ...added, ...removed];

    console.log(`[Webhook]   Changed files: ${allChangedFiles.length}`);

    if (allChangedFiles.length === 0) {
      console.log('[Webhook]   No files changed, skipping\n');
      continue;
    }

    // Check if any documentation files changed
    if (!analyzer.shouldSync('', allChangedFiles)) {
      console.log('[Webhook]   No documentation files changed, skipping\n');
      continue;
    }

    // Filter for documentation files only
    const docFiles = allChangedFiles.filter((file) =>
      analyzer.isDocumentationFile(file)
    );

    console.log(`[Webhook]   Documentation files changed: ${docFiles.length}`);
    docFiles.forEach((f) => console.log(`[Webhook]     - ${f}`));

    // Trigger sync for each documentation file
    for (const filePath of docFiles) {
      try {
        // Skip removed files
        if (removed.includes(filePath)) {
          console.log(`[Webhook]   ⚠️  File removed, skipping: ${filePath}`);
          continue;
        }

        console.log(`[Webhook]   🔄 Triggering sync for: ${filePath}\n`);

        // This is the main sync operation
        await syncDocumentationChange(repoUrl, filePath, commitId);
      } catch (error) {
        console.error(`[Webhook]   ❌ Failed to sync ${filePath}:`, error);
        // Continue with other files even if one fails
      }
    }

    console.log(''); // Empty line between commits
  }
}

/**
 * GET /api/webhook/github
 *
 * Health check endpoint
 * Verify the webhook endpoint is accessible
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'GitHub webhook endpoint is ready',
    timestamp: new Date().toISOString(),
    info: {
      description: 'Send POST requests with GitHub webhook payloads',
      events: ['push', 'pull_request'],
      setup: 'Configure in GitHub repository settings → Webhooks',
    },
  });
}

/**
 * Verify GitHub webhook signature (optional security measure)
 *
 * To enable:
 * 1. Set GITHUB_WEBHOOK_SECRET in .env
 * 2. Configure same secret in GitHub webhook settings
 * 3. Uncomment the verification code below
 */
function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * OPTIONS handler for CORS (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-GitHub-Event',
      },
    }
  );
}
