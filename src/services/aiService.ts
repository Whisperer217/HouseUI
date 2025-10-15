interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIStreamCallback {
  onToken: (token: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

interface AIConfig {
  endpoint: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_CONFIG: AIConfig = {
  endpoint: 'http://localhost:11434',
  model: 'llama3',
  temperature: 0.7,
  maxTokens: 2000,
};

class AIService {
  private config: AIConfig;

  constructor() {
    const savedConfig = localStorage.getItem('ai_config');
    this.config = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('ai_config', JSON.stringify(this.config));
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async generateResponse(
    messages: AIMessage[],
    callbacks: AIStreamCallback,
    context?: string
  ): Promise<void> {
    try {
      const systemMessage: AIMessage = {
        role: 'system',
        content: this.buildSystemPrompt(context),
      };

      const allMessages = [systemMessage, ...messages];

      const response = await fetch(`${this.config.endpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: allMessages,
          stream: true,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              const token = json.message.content;
              fullResponse += token;
              callbacks.onToken(token);
            }
            if (json.done) {
              callbacks.onComplete(fullResponse);
              return;
            }
          } catch (e) {
            console.warn('Error parsing JSON line:', e);
          }
        }
      }

      callbacks.onComplete(fullResponse);
    } catch (error) {
      callbacks.onError(error as Error);
    }
  }

  private buildSystemPrompt(context?: string): string {
    const basePrompt = `You are a helpful AI assistant for a family creative platform. You help with:
- Game and app development projects
- Homework and learning
- Creative writing and storytelling
- Coding and technical questions
- Project planning and brainstorming

You are friendly, encouraging, and educational. You explain things clearly and adapt your responses to the user's level.`;

    if (context) {
      return `${basePrompt}\n\nCurrent Context:\n${context}`;
    }

    return basePrompt;
  }

  buildContextFromProjects(projects: any[]): string {
    if (!projects.length) return '';

    const projectList = projects
      .map((p) => `- ${p.title}: ${p.description}`)
      .join('\n');

    return `Active Projects:\n${projectList}`;
  }

  buildContextFromThread(threadName: string, threadDescription?: string): string {
    let context = `Current Thread: ${threadName}`;
    if (threadDescription) {
      context += `\nDescription: ${threadDescription}`;
    }
    return context;
  }
}

export const aiService = new AIService();
export type { AIMessage, AIStreamCallback, AIConfig };
