/**
 * Test script for repository analysis
 *
 * Usage:
 *   npm run test:analyze <github-repo-url>
 *
 * Example:
 *   npm run test:analyze https://github.com/vercel/next.js
 */

import { RepositoryAnalyzer } from '../lib/claude/repository-analyzer';
import { ContentGeneratorAgent } from '../lib/claude/content-generator';

async function testAnalyzeRepo() {
  // Get repo URL from command line args
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error('❌ Error: Repository URL is required');
    console.log('\nUsage: npm run test:analyze <github-repo-url>');
    console.log('Example: npm run test:analyze https://github.com/vercel/next.js');
    process.exit(1);
  }

  console.log('🔍 Devonboard AI - Repository Analysis Test\n');
  console.log('=' .repeat(60));
  console.log(`Repository: ${repoUrl}`);
  console.log('=' .repeat(60));
  console.log();

  // Check environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in environment');
    console.log('\n💡 Tip: Create a .env file with your API key:');
    console.log('   ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  if (!process.env.GITHUB_TOKEN) {
    console.warn('⚠️  Warning: GITHUB_TOKEN not set. Rate limits may apply.\n');
  }

  try {
    // Step 1: Analyze Repository
    console.log('📊 Step 1: Analyzing repository structure...\n');
    const startTime = Date.now();

    const analyzer = new RepositoryAnalyzer(process.env.GITHUB_TOKEN);
    const analysis = await analyzer.analyzeRepository(repoUrl);

    const analysisTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Repository analysis complete! (${analysisTime}s)\n`);

    // Display Analysis Results
    console.log('=' .repeat(60));
    console.log('📋 ANALYSIS RESULTS');
    console.log('=' .repeat(60));
    console.log();

    console.log('🔧 Tech Stack:');
    console.log(`  Languages: ${analysis.techStack.languages.join(', ')}`);
    console.log(`  Frameworks: ${analysis.techStack.frameworks.join(', ')}`);
    console.log(`  Tools: ${analysis.techStack.tools.join(', ')}`);
    console.log();

    console.log('🏗️  Project Structure:');
    console.log(`  Type: ${analysis.structure.type}`);
    console.log(`  Main Directories: ${analysis.structure.mainDirectories.join(', ')}`);
    console.log(`  Entry Points: ${analysis.structure.entryPoints.join(', ')}`);
    console.log();

    console.log('⚙️  Setup Requirements:');
    console.log(`  Environment: ${analysis.setupRequirements.environment.join(', ')}`);
    console.log(`  Services: ${analysis.setupRequirements.services.join(', ')}`);
    console.log(`  Credentials: ${analysis.setupRequirements.credentials.join(', ')}`);
    console.log();

    // Step 2: Generate Onboarding Steps
    console.log('=' .repeat(60));
    console.log('📝 Step 2: Generating onboarding plan...\n');
    const genStartTime = Date.now();

    const generator = new ContentGeneratorAgent();
    const steps = await generator.generateOnboardingPlan(analysis, {
      name: 'Test Organization',
      targetAudience: 'General developers'
    });

    const genTime = ((Date.now() - genStartTime) / 1000).toFixed(2);
    console.log(`✅ Onboarding plan generated! (${genTime}s)\n`);

    console.log('=' .repeat(60));
    console.log('📚 ONBOARDING STEPS');
    console.log('=' .repeat(60));
    console.log();

    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title || 'Untitled Step'}`);
      console.log(`   Type: ${step.step_type}`);
      console.log(`   Duration: ${step.estimated_duration || 'N/A'} minutes`);
      if (step.description) {
        console.log(`   Description: ${step.description}`);
      }
      if (step.content?.commands && step.content.commands.length > 0) {
        console.log(`   Commands: ${step.content.commands.slice(0, 2).join(', ')}${step.content.commands.length > 2 ? '...' : ''}`);
      }
      console.log();
    });

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalDuration = steps.reduce((sum, step) => sum + (step.estimated_duration || 0), 0);

    console.log('=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Analysis Time: ${totalTime}s`);
    console.log(`Steps Generated: ${steps.length}`);
    console.log(`Estimated Onboarding Duration: ${totalDuration} minutes (~${(totalDuration / 60).toFixed(1)} hours)`);
    console.log();

    // Cost Estimate (rough)
    const estimatedTokens = 10000 + steps.length * 500; // Rough estimate
    const estimatedCost = (estimatedTokens / 1_000_000) * 3; // Input tokens
    console.log(`Estimated API Cost: $${estimatedCost.toFixed(4)}`);
    console.log();

    console.log('✅ Test completed successfully!\n');

    // Write results to file
    const fs = await import('fs');
    const outputPath = `./analysis-result-${Date.now()}.json`;
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          repository: repoUrl,
          analyzedAt: new Date().toISOString(),
          analysis,
          onboardingSteps: steps,
          metadata: {
            analysisTimeSeconds: parseFloat(analysisTime),
            generationTimeSeconds: parseFloat(genTime),
            totalTimeSeconds: parseFloat(totalTime),
            stepsCount: steps.length,
            totalDuration: totalDuration,
          },
        },
        null,
        2
      )
    );

    console.log(`💾 Full results saved to: ${outputPath}\n`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run the test
testAnalyzeRepo();
