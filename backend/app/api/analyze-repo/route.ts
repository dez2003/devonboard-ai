import { NextRequest, NextResponse } from 'next/server';
import { RepositoryAnalyzer } from '@/lib/claude/repository-analyzer';
import { ContentGeneratorAgent } from '@/lib/claude/content-generator';
import { RepositoryAnalysis } from '@/types';

/**
 * POST /api/analyze-repo
 *
 * Analyzes a GitHub repository and generates an onboarding plan
 *
 * Request body:
 * {
 *   "repoUrl": "https://github.com/owner/repo",
 *   "githubToken": "optional_github_token",
 *   "organizationContext": {
 *     "name": "optional_org_name",
 *     "customRequirements": ["array", "of", "requirements"],
 *     "targetAudience": "junior devs | senior devs | etc"
 *   },
 *   "generateSteps": true // whether to generate detailed onboarding steps
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "analysis": RepositoryAnalysis,
 *     "onboardingSteps": OnboardingStep[] (if generateSteps: true)
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      repoUrl,
      githubToken,
      organizationContext,
      generateSteps = true
    } = body;

    // Validate required fields
    if (!repoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Repository URL is required'
        },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    if (!isValidGitHubUrl(repoUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo'
        },
        { status: 400 }
      );
    }

    console.log(`[analyze-repo] Starting analysis for: ${repoUrl}`);

    // Initialize Repository Analyzer
    const analyzer = new RepositoryAnalyzer(githubToken);

    // Analyze the repository
    let analysis: RepositoryAnalysis;
    try {
      analysis = await analyzer.analyzeRepository(repoUrl);
      console.log(`[analyze-repo] Analysis completed`);
    } catch (error: any) {
      console.error('[analyze-repo] Repository analysis failed:', error);

      // Handle specific GitHub errors
      if (error.message?.includes('Not Found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Repository not found. Please check the URL and ensure you have access to this repository.'
          },
          { status: 404 }
        );
      }

      if (error.message?.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'GitHub API rate limit exceeded. Please provide a GitHub token or try again later.'
          },
          { status: 429 }
        );
      }

      throw error; // Re-throw for generic error handling
    }

    // Optionally generate detailed onboarding steps
    let onboardingSteps;
    if (generateSteps) {
      console.log(`[analyze-repo] Generating onboarding steps...`);
      const generator = new ContentGeneratorAgent();

      try {
        onboardingSteps = await generator.generateOnboardingPlan(
          analysis,
          organizationContext
        );
        console.log(`[analyze-repo] Generated ${onboardingSteps.length} steps`);
      } catch (error) {
        console.error('[analyze-repo] Failed to generate onboarding steps:', error);
        // Continue without steps rather than failing the entire request
        onboardingSteps = [];
      }
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        onboardingSteps: generateSteps ? onboardingSteps : undefined,
        metadata: {
          analyzedAt: new Date().toISOString(),
          repoUrl,
          stepsGenerated: generateSteps ? onboardingSteps?.length || 0 : 0
        }
      }
    });

  } catch (error: any) {
    console.error('[analyze-repo] Unexpected error:', error);

    // Handle Claude API errors
    if (error.message?.includes('Claude')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI analysis failed. Please check your API key configuration.'
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-repo?url=...
 *
 * Quick analysis endpoint (GET request for simple use cases)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repoUrl = searchParams.get('url');

    if (!repoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Repository URL is required (query param: url)'
        },
        { status: 400 }
      );
    }

    // Use the POST handler logic
    return POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({
          repoUrl,
          generateSteps: false // Don't generate steps for quick GET requests
        }),
      })
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate GitHub URL format
 */
function isValidGitHubUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/,
    /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\.git$/,
    /^git@github\.com:[^\/]+\/[^\/]+\.git$/,
  ];

  return patterns.some(pattern => pattern.test(url));
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
