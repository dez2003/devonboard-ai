import { ClaudeClient } from './client';
import { OnboardingStep } from '@/types';

/**
 * Change Analysis Result
 */
export interface ChangeAnalysis {
  severity: number; // 1-10 scale
  affectedStepTitles: string[];
  shouldAutoUpdate: boolean;
  summary: string;
  suggestedUpdates: {
    stepTitle: string;
    newInstructions: string;
    reason: string;
  }[];
}

/**
 * Change Analyzer Agent
 * Analyzes documentation changes and determines impact on onboarding steps
 */
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
  ): Promise<ChangeAnalysis> {
    console.log(`[ChangeAnalyzer] Analyzing ${filePath}...`);

    // Truncate content to avoid token limits
    const maxLength = 2000;
    const oldTruncated = oldContent.substring(0, maxLength);
    const newTruncated = newContent.substring(0, maxLength);

    const systemPrompt = `You are an expert at analyzing documentation changes and their impact on developer onboarding.
Your task is to determine:
1. How severe the change is (1-10)
2. Which onboarding steps are affected
3. Whether it's safe to auto-update
4. Suggested updates to affected steps`;

    const prompt = `A documentation file has changed. Analyze the impact on onboarding.

FILE PATH: ${filePath}

OLD CONTENT:
${oldTruncated}
${oldContent.length > maxLength ? '\n... (truncated)' : ''}

NEW CONTENT:
${newTruncated}
${newContent.length > maxLength ? '\n... (truncated)' : ''}

CURRENT ONBOARDING STEPS:
${currentSteps
  .map(
    (s, i) =>
      `${i + 1}. "${s.title}" (${s.step_type}): ${s.content.instructions.substring(0, 100)}...`
  )
  .join('\n')}

ANALYSIS REQUIRED:

1. **Severity** (1-10 scale):
   - 1-3: Minor (typo, formatting)
   - 4-6: Moderate (clarification, additional info)
   - 7-9: Major (process change, new requirements)
   - 10: Breaking (critical change requiring manual review)

2. **Affected Steps**: Which onboarding steps reference this content?

3. **Auto-Update Decision**:
   - Auto-update if severity < 7 AND changes are additive
   - Require manual review if severity >= 7 OR changes remove content

4. **Suggested Updates**: For each affected step, provide updated instructions

Return as JSON matching this structure:
{
  "severity": number (1-10),
  "affectedStepTitles": ["exact step titles"],
  "shouldAutoUpdate": boolean,
  "summary": "brief description of what changed",
  "suggestedUpdates": [{
    "stepTitle": "exact step title",
    "newInstructions": "updated instructions in markdown",
    "reason": "why this update is needed"
  }]
}`;

    const schema = `{
  "severity": "number",
  "affectedStepTitles": ["string"],
  "shouldAutoUpdate": "boolean",
  "summary": "string",
  "suggestedUpdates": [{
    "stepTitle": "string",
    "newInstructions": "string",
    "reason": "string"
  }]
}`;

    try {
      const analysis = await this.claude.analyzeStructured<ChangeAnalysis>(
        prompt,
        schema,
        {
          systemPrompt,
          maxTokens: 4096,
        }
      );

      console.log(`[ChangeAnalyzer] Analysis complete:`, {
        severity: analysis.severity,
        affected: analysis.affectedStepTitles.length,
        autoUpdate: analysis.shouldAutoUpdate,
      });

      return analysis;
    } catch (error) {
      console.error('[ChangeAnalyzer] Analysis failed:', error);

      // Return conservative defaults on error
      return {
        severity: 10, // Require manual review
        affectedStepTitles: [],
        shouldAutoUpdate: false,
        summary: 'Failed to analyze changes - manual review required',
        suggestedUpdates: [],
      };
    }
  }

  /**
   * Quick check if a file path is likely documentation
   */
  isDocumentationFile(filePath: string): boolean {
    const docPatterns = [
      /\.md$/i,
      /README/i,
      /CONTRIBUTING/i,
      /SETUP/i,
      /INSTALL/i,
      /ONBOARDING/i,
      /^docs\//i,
      /\/docs\//i,
      /\.txt$/i,
    ];

    return docPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Determine if a change should trigger sync based on file path
   */
  shouldSync(filePath: string, modifiedFiles: string[]): boolean {
    // Check if any modified file is documentation
    const hasDocChanges = modifiedFiles.some((f) =>
      this.isDocumentationFile(f)
    );

    if (!hasDocChanges) {
      console.log('[ChangeAnalyzer] No documentation files changed, skipping');
      return false;
    }

    console.log('[ChangeAnalyzer] Documentation files changed:', {
      files: modifiedFiles.filter((f) => this.isDocumentationFile(f)),
    });

    return true;
  }
}

// Singleton instance
let analyzerInstance: ChangeAnalyzer | null = null;

/**
 * Get the shared Change Analyzer instance
 */
export function getChangeAnalyzer(): ChangeAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new ChangeAnalyzer();
  }
  return analyzerInstance;
}
