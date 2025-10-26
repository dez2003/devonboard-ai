import { ClaudeClient } from './client';
import { Octokit } from '@octokit/rest';
import { RepositoryAnalysis } from '@/types';

/**
 * Repository Analyzer Agent
 * Uses Claude to analyze GitHub repositories and generate onboarding plans
 */
export class RepositoryAnalyzer {
  private claude: ClaudeClient;
  private octokit: Octokit;

  constructor(githubToken?: string) {
    this.claude = new ClaudeClient();
    this.octokit = new Octokit({
      auth: githubToken || process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Analyze a GitHub repository and generate onboarding plan
   */
  async analyzeRepository(repoUrl: string): Promise<RepositoryAnalysis> {
    // Parse GitHub URL
    const { owner, repo } = this.parseGitHubUrl(repoUrl);

    console.log(`Analyzing repository: ${owner}/${repo}`);

    // Fetch repository structure and key files
    const repoData = await this.fetchRepositoryData(owner, repo);

    // Analyze with Claude
    const analysis = await this.analyzeWithClaude(repoData);

    return analysis;
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    // Handle various GitHub URL formats
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\.]+)/,
      /github\.com:([^\/]+)\/([^\/\.]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }

    throw new Error('Invalid GitHub URL format');
  }

  /**
   * Fetch repository data from GitHub
   */
  private async fetchRepositoryData(
    owner: string,
    repo: string
  ): Promise<{
    name: string;
    description: string;
    languages: Record<string, number>;
    files: Array<{ path: string; content: string }>;
    structure: string;
  }> {
    // Get repo metadata
    const { data: repoInfo } = await this.octokit.repos.get({ owner, repo });

    // Get languages
    const { data: languages } = await this.octokit.repos.listLanguages({
      owner,
      repo,
    });

    // Get repository tree
    const { data: tree } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: 'true',
    });

    // Build directory structure
    const structure = this.buildDirectoryStructure(tree.tree);

    // Fetch key files
    const keyFiles = await this.fetchKeyFiles(owner, repo, tree.tree);

    return {
      name: repoInfo.name,
      description: repoInfo.description || '',
      languages,
      files: keyFiles,
      structure,
    };
  }

  /**
   * Build a text representation of directory structure
   */
  private buildDirectoryStructure(
    tree: Array<{ path?: string; type?: string }>
  ): string {
    const paths = tree
      .filter((item) => item.path)
      .map((item) => item.path!)
      .sort();

    // Build tree structure (simple version)
    let structure = '';
    const maxPaths = 100; // Limit to avoid token overload

    for (let i = 0; i < Math.min(paths.length, maxPaths); i++) {
      const path = paths[i];
      const depth = path.split('/').length - 1;
      const indent = '  '.repeat(depth);
      const name = path.split('/').pop();
      structure += `${indent}${name}\n`;
    }

    if (paths.length > maxPaths) {
      structure += `\n... and ${paths.length - maxPaths} more files\n`;
    }

    return structure;
  }

  /**
   * Fetch content of key files
   */
  private async fetchKeyFiles(
    owner: string,
    repo: string,
    tree: Array<{ path?: string; type?: string; size?: number }>
  ): Promise<Array<{ path: string; content: string }>> {
    // Define priority files to fetch
    const priorityFiles = [
      'README.md',
      'CONTRIBUTING.md',
      'package.json',
      'requirements.txt',
      'Cargo.toml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'Gemfile',
      'composer.json',
      'setup.py',
      'Dockerfile',
      'docker-compose.yml',
      '.env.example',
      'tsconfig.json',
    ];

    const filesToFetch = tree
      .filter((item) => {
        if (!item.path || item.type !== 'blob') return false;
        // Limit file size to 100KB
        if (item.size && item.size > 100000) return false;

        // Check if it's a priority file
        const fileName = item.path.split('/').pop()!;
        return priorityFiles.includes(fileName);
      })
      .slice(0, 15); // Limit to 15 files

    const files: Array<{ path: string; content: string }> = [];

    for (const file of filesToFetch) {
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: file.path!,
        });

        if ('content' in data && data.content) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          files.push({
            path: file.path!,
            content,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch ${file.path}:`, error);
      }
    }

    return files;
  }

  /**
   * Analyze repository data with Claude
   */
  private async analyzeWithClaude(repoData: {
    name: string;
    description: string;
    languages: Record<string, number>;
    files: Array<{ path: string; content: string }>;
    structure: string;
  }): Promise<RepositoryAnalysis> {
    const systemPrompt = `You are an expert software engineer and technical onboarding specialist.
Your task is to analyze codebases and create comprehensive, practical onboarding plans for new developers.

Focus on:
1. Identifying the tech stack and architecture
2. Understanding setup requirements (environment, services, credentials)
3. Creating logical, step-by-step onboarding tasks
4. Providing clear, actionable instructions
5. Estimating realistic time for each step`;

    // Build the analysis prompt
    const prompt = this.buildAnalysisPrompt(repoData);

    // Define the expected schema
    const schema = `{
  "techStack": {
    "languages": ["string"],
    "frameworks": ["string"],
    "tools": ["string"],
    "buildSystem": "string",
    "packageManager": "string"
  },
  "setupRequirements": {
    "environment": ["string"],
    "services": ["string"],
    "credentials": ["string"],
    "ports": ["number"]
  },
  "architecture": {
    "type": "string",
    "patterns": ["string"],
    "structure": "string"
  },
  "onboardingSteps": [
    {
      "title": "string",
      "step_type": "setup | documentation | task | verification",
      "content": {
        "instructions": "string",
        "commands": ["string"],
        "code": "string (optional)",
        "verificationSteps": ["string"]
      },
      "estimated_duration": "number (in minutes)",
      "dependencies": ["step index"]
    }
  ]
}`;

    try {
      const analysis = await this.claude.analyzeStructured<RepositoryAnalysis>(
        prompt,
        schema,
        {
          systemPrompt,
          maxTokens: 8192, // Allow longer response for detailed analysis
        }
      );

      return analysis;
    } catch (error) {
      console.error('Claude analysis failed:', error);
      throw new Error('Failed to analyze repository with Claude');
    }
  }

  /**
   * Build the analysis prompt from repository data
   */
  private buildAnalysisPrompt(repoData: {
    name: string;
    description: string;
    languages: Record<string, number>;
    files: Array<{ path: string; content: string }>;
    structure: string;
  }): string {
    const languageList = Object.keys(repoData.languages)
      .sort((a, b) => repoData.languages[b] - repoData.languages[a])
      .slice(0, 5)
      .join(', ');

    let prompt = `Analyze this GitHub repository and create a comprehensive onboarding plan.

# Repository Information
- Name: ${repoData.name}
- Description: ${repoData.description}
- Primary Languages: ${languageList}

# Directory Structure
\`\`\`
${repoData.structure}
\`\`\`

# Key Files

`;

    // Add file contents
    for (const file of repoData.files) {
      const truncatedContent =
        file.content.length > 3000
          ? file.content.substring(0, 3000) + '\n... (truncated)'
          : file.content;

      prompt += `## ${file.path}
\`\`\`
${truncatedContent}
\`\`\`

`;
    }

    prompt += `
# Task

Based on this repository:

1. **Identify the tech stack**: Languages, frameworks, build tools, package managers
2. **Determine setup requirements**: What does a new developer need to install? What environment variables? What services to run?
3. **Create onboarding steps**: Break down the onboarding process into 8-15 actionable steps that take a developer from "just cloned the repo" to "made their first contribution"

Each step should:
- Have a clear, specific title
- Include detailed instructions
- List exact commands to run (if applicable)
- Provide verification steps to confirm success
- Estimate time realistically (in minutes)
- Reference dependencies (which steps must be completed first)

Step types:
- **setup**: Installing tools, configuring environment
- **documentation**: Reading key docs, understanding architecture
- **task**: Actually doing something (run tests, make a change)
- **verification**: Confirming everything works

Focus on practical, real-world onboarding that gets developers productive quickly.`;

    return prompt;
  }
}
