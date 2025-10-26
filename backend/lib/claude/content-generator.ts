import { ClaudeClient } from './client';
import { RepositoryAnalysis, OnboardingStep } from '@/types';

/**
 * Content Generator Agent
 * Creates comprehensive, personalized onboarding content
 */
export class ContentGeneratorAgent {
  private claude: ClaudeClient;

  constructor() {
    this.claude = new ClaudeClient();
  }

  /**
   * Generate comprehensive onboarding plan from repository analysis
   */
  async generateOnboardingPlan(
    analysis: RepositoryAnalysis,
    organizationContext?: {
      name?: string;
      customRequirements?: string[];
      targetAudience?: string;
    }
  ): Promise<Partial<OnboardingStep>[]> {
    const systemPrompt = `You are an expert technical onboarding specialist.
Your task is to create comprehensive, practical onboarding plans that take developers from "just cloned the repo" to "made their first contribution".

Focus on:
1. Logical progression of steps
2. Clear, actionable instructions
3. Exact commands to run
4. Verification steps for each task
5. Realistic time estimates
6. Proper dependencies between steps`;

    const prompt = `Generate a comprehensive onboarding plan for a new developer joining this project.

# Repository Analysis

## Tech Stack
- Languages: ${analysis.techStack.languages.join(', ')}
- Frameworks: ${analysis.techStack.frameworks.join(', ')}
- Tools: ${analysis.techStack.tools.join(', ')}

## Project Structure
- Type: ${analysis.structure.type}
- Main Directories: ${analysis.structure.mainDirectories.join(', ')}
- Entry Points: ${analysis.structure.entryPoints.join(', ')}

## Setup Requirements
- Environment: ${analysis.setupRequirements.environment.join(', ')}
- Services: ${analysis.setupRequirements.services.join(', ')}
- Credentials: ${analysis.setupRequirements.credentials.join(', ')}

${organizationContext ? `
## Organization Context
- Organization: ${organizationContext.name || 'Not specified'}
- Target Audience: ${organizationContext.targetAudience || 'General developers'}
- Custom Requirements: ${organizationContext.customRequirements?.join(', ') || 'None'}
` : ''}

# Task

Create 8-15 detailed onboarding steps that cover:

1. **Environment Setup**: Installing required tools and dependencies
2. **Repository Setup**: Cloning, installing dependencies
3. **Configuration**: Setting up environment variables, credentials
4. **Local Development**: Running the project locally
5. **Testing**: Running tests, understanding test structure
6. **Making Changes**: Understanding workflow, making first change
7. **Documentation**: Reading key docs, understanding architecture

# Output Format

Return a JSON array of steps. Each step must have:

\`\`\`json
{
  "title": "Clear, actionable title (e.g., 'Install Node.js and npm')",
  "description": "Brief overview of what this step accomplishes",
  "step_type": "setup | documentation | task | verification",
  "content": {
    "instructions": "Detailed step-by-step instructions in markdown format",
    "commands": ["array", "of", "exact", "commands"],
    "code": "Optional code snippet if needed",
    "verificationSteps": [
      "How to verify this step completed successfully",
      "Expected output or behavior"
    ]
  },
  "estimated_duration": 15,
  "dependencies": []
}
\`\`\`

## Guidelines:

1. **Be Specific**: Include exact commands, file paths, version numbers
2. **Be OS-Aware**: Mention platform-specific instructions when needed
3. **Add Verification**: Every step should have clear success criteria
4. **Estimate Realistically**: Time estimates should be realistic for someone new to the project
5. **Order Logically**: Steps should build on each other
6. **Handle Errors**: Include common troubleshooting tips in instructions

Return ONLY the JSON array, no additional text.`;

    const schema = `
{
  "steps": [
    {
      "title": "string",
      "description": "string",
      "step_type": "setup | documentation | task | verification",
      "content": {
        "instructions": "string (markdown formatted)",
        "commands": ["string"],
        "code": "string (optional)",
        "verificationSteps": ["string"]
      },
      "estimated_duration": "number (minutes)",
      "dependencies": ["number (indices of dependent steps)"]
    }
  ]
}`;

    try {
      const result = await this.claude.analyzeStructured<{
        steps: Partial<OnboardingStep>[];
      }>(prompt, schema, {
        systemPrompt,
        maxTokens: 8192,
      });

      return result.steps;
    } catch (error) {
      console.error('Failed to generate onboarding plan:', error);
      throw new Error('Failed to generate onboarding plan with Claude');
    }
  }

  /**
   * Generate platform-specific setup script
   */
  async generateSetupScript(
    platform: 'mac' | 'windows' | 'linux',
    techStack: string[]
  ): Promise<string> {
    const systemPrompt = `You are an expert in writing automated setup scripts.
Your scripts should be idempotent, safe, and handle errors gracefully.`;

    const prompt = `Generate an automated setup script for ${platform} that installs:

${techStack.map((tool) => `- ${tool}`).join('\n')}

# Requirements:

1. **Check Existing Installations**: Don't reinstall if already present
2. **Error Handling**: Handle failures gracefully, provide clear error messages
3. **Progress Feedback**: Show what's being installed
4. **Verification**: Verify each installation succeeded
5. **Idempotent**: Safe to run multiple times
6. **Package Manager**: Use the appropriate package manager:
   - Mac: Homebrew
   - Linux: apt/yum (detect which)
   - Windows: Chocolatey or manual downloads

# Output

Return a complete, runnable script with:
- Shebang line
- Comments explaining each section
- Clear error messages
- Success confirmations

${platform === 'mac' ? '**Format**: Bash script (.sh)' : ''}
${platform === 'linux' ? '**Format**: Bash script (.sh)' : ''}
${platform === 'windows' ? '**Format**: PowerShell script (.ps1)' : ''}

Return ONLY the script code, no additional explanation.`;

    try {
      const script = await this.claude.sendMessage(prompt, {
        systemPrompt,
        maxTokens: 4096,
        temperature: 0.3, // Lower temp for code generation
      });

      // Clean up the response (remove markdown if present)
      let cleanScript = script.trim();
      if (cleanScript.startsWith('```')) {
        cleanScript = cleanScript.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }

      return cleanScript;
    } catch (error) {
      console.error('Failed to generate setup script:', error);
      throw new Error('Failed to generate setup script');
    }
  }

  /**
   * Generate .env.example template
   */
  async generateEnvironmentTemplate(
    requiredVars: string[],
    context: {
      projectName?: string;
      description?: string;
      techStack?: string[];
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert at documenting environment configurations.
Your templates should be clear, comprehensive, and developer-friendly.`;

    const prompt = `Create a .env.example file for a project that requires these environment variables:

${requiredVars.map((v) => `- ${v}`).join('\n')}

# Project Context
${context.projectName ? `- Name: ${context.projectName}` : ''}
${context.description ? `- Description: ${context.description}` : ''}
${context.techStack ? `- Tech Stack: ${context.techStack.join(', ')}` : ''}

# Requirements

For each variable:
1. **Descriptive Comment**: Explain what it's for and why it's needed
2. **Example Value**: Show the correct format (use dummy values)
3. **Required/Optional**: Indicate if it's required or has a default
4. **Where to Get It**: Link to docs or explain how to obtain the value
5. **Security Note**: If sensitive, add a warning

# Format Example:

\`\`\`
# Database Connection
# Required: Yes
# Where to get: Create a PostgreSQL database (local or cloud)
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# API Key for External Service
# Required: Yes
# Where to get: https://example.com/api-keys
# WARNING: Keep this secret! Never commit to git
API_KEY=your_api_key_here

# Optional feature flag
# Required: No (defaults to false)
# Set to 'true' to enable experimental features
ENABLE_FEATURE_X=false
\`\`\`

Return ONLY the .env.example file content, no additional explanation.`;

    try {
      const template = await this.claude.sendMessage(prompt, {
        systemPrompt,
        maxTokens: 2048,
        temperature: 0.3,
      });

      // Clean up the response
      let cleanTemplate = template.trim();
      if (cleanTemplate.startsWith('```')) {
        cleanTemplate = cleanTemplate.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }

      return cleanTemplate;
    } catch (error) {
      console.error('Failed to generate environment template:', error);
      throw new Error('Failed to generate environment template');
    }
  }

  /**
   * Enhance a single onboarding step with more details
   */
  async enhanceStep(
    step: Partial<OnboardingStep>,
    context: {
      techStack?: string[];
      previousSteps?: Partial<OnboardingStep>[];
    }
  ): Promise<Partial<OnboardingStep>> {
    const systemPrompt = `You are an expert at creating detailed, actionable technical instructions.
Your enhanced instructions should be clear, thorough, and anticipate common issues.`;

    const prompt = `Enhance this onboarding step with more detail:

# Current Step
- Title: ${step.title}
- Description: ${step.description || 'No description'}
- Type: ${step.step_type}
${step.content ? `- Current Instructions: ${step.content.instructions}` : ''}

${context.techStack ? `\n# Tech Stack Context\n${context.techStack.join(', ')}` : ''}

# Task

Enhance this step by:
1. Expanding the instructions with more detail
2. Adding specific commands with explanations
3. Including verification steps
4. Adding troubleshooting tips for common issues
5. Suggesting realistic time estimate

Return as JSON matching the OnboardingStep content structure.`;

    const schema = `{
  "title": "string",
  "description": "string",
  "step_type": "setup | documentation | task | verification",
  "content": {
    "instructions": "string (detailed markdown)",
    "commands": ["string"],
    "code": "string (optional)",
    "verificationSteps": ["string"]
  },
  "estimated_duration": "number"
}`;

    try {
      const enhanced = await this.claude.analyzeStructured<Partial<OnboardingStep>>(
        prompt,
        schema,
        {
          systemPrompt,
          maxTokens: 2048,
        }
      );

      return {
        ...step,
        ...enhanced,
      };
    } catch (error) {
      console.error('Failed to enhance step:', error);
      // Return original step if enhancement fails
      return step;
    }
  }
}

// Singleton instance
let generatorInstance: ContentGeneratorAgent | null = null;

/**
 * Get the shared Content Generator instance
 */
export function getContentGenerator(): ContentGeneratorAgent {
  if (!generatorInstance) {
    generatorInstance = new ContentGeneratorAgent();
  }
  return generatorInstance;
}
