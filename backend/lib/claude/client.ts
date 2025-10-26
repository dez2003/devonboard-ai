import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude API Client wrapper
 * Handles communication with Anthropic's Claude API
 */
export class ClaudeClient {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = 'claude-3-5-sonnet-20241022';
  }

  /**
   * Send a message to Claude and get a response
   */
  async sendMessage(
    prompt: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1.0,
      system: options?.systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }

    throw new Error('No text content in Claude response');
  }

  /**
   * Send a message with conversation history
   */
  async sendConversation(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1.0,
      system: options?.systemPrompt,
      messages: messages,
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }

    throw new Error('No text content in Claude response');
  }

  /**
   * Analyze structured data and return JSON
   */
  async analyzeStructured<T>(
    prompt: string,
    schema: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
    }
  ): Promise<T> {
    const fullPrompt = `${prompt}

Please respond with valid JSON matching this schema:
${schema}

Return ONLY the JSON, no additional text or markdown formatting.`;

    const response = await this.sendMessage(fullPrompt, {
      systemPrompt: options?.systemPrompt,
      maxTokens: options?.maxTokens || 4096,
      temperature: 0.3, // Lower temperature for structured output
    });

    // Try to extract JSON from response
    let jsonText = response.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse Claude response as JSON:', response);
      throw new Error('Claude response was not valid JSON');
    }
  }

  /**
   * Get usage stats from last response
   */
  async getUsageStats(prompt: string): Promise<{
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  }> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // Claude 3.5 Sonnet pricing (as of Oct 2024)
    // Input: $3 per million tokens
    // Output: $15 per million tokens
    const inputCost = (response.usage.input_tokens / 1_000_000) * 3;
    const outputCost = (response.usage.output_tokens / 1_000_000) * 15;

    return {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      estimatedCost: inputCost + outputCost,
    };
  }
}

// Singleton instance
let claudeInstance: ClaudeClient | null = null;

/**
 * Get the shared Claude client instance
 */
export function getClaudeClient(): ClaudeClient {
  if (!claudeInstance) {
    claudeInstance = new ClaudeClient();
  }
  return claudeInstance;
}
