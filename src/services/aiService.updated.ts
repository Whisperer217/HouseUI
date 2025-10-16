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
  backendUrl: string;  // Updated: now points to backend proxy
  model: string;
  temperature?: number;
  maxTokens?: number;
  preferredNode?: string;  // Optional: specify which Ollama node to use
}

interface ComputeNode {
  id: string;
  name: string;
  endpoint: string;
  type: 'ollama' | 'openwebui' | 'custom';
  isOnline: boolean;
  models: string[];
  location: 'local' | 'tailscale' | 'remote';
}

// Get backend URL from environment variable or default to localhost
const getBackendUrl = (): string => {
  // Vite exposes env vars with VITE_ prefix
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
};

const DEFAULT_CONFIG: AIConfig = {
  backendUrl: getBackendUrl(),
  model: 'deepseek-r1:8b',  // Updated default to DeepSeek R1 8B
  temperature: 0.7,
  maxTokens: 2000,
};

class AIService {
  private config: AIConfig;
  private computeNodes: ComputeNode[] = [];

  constructor() {
    const savedConfig = localStorage.getItem('ai_config');
    this.config = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
    
    // Ensure backendUrl is set from environment if not in saved config
    if (!this.config.backendUrl) {
      this.config.backendUrl = getBackendUrl();
    }
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('ai_config', JSON.stringify(this.config));
  }

  getComputeNodes(): ComputeNode[] {
    return [...this.computeNodes];
  }

  async refreshComputeNodes() {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/nodes`);
      if (!response.ok) {
        throw new Error('Failed to fetch compute nodes');
      }
      
      const data = await response.json();
      this.computeNodes = data.nodes || [];
      return this.computeNodes;
    } catch (error) {
      console.error('Error refreshing compute nodes:', error);
      return [];
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/check`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.connected === true;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const url = this.config.preferredNode
        ? `${this.config.backendUrl}/api/models?endpoint=${encodeURIComponent(this.config.preferredNode)}`
        : `${this.config.backendUrl}/api/models`;
      
      const response = await fetch(url);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models || [];
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
      
      // Make request to backend proxy
      const response = await fetch(`${this.config.backendUrl}/api/chat`, {
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
          endpoint: this.config.preferredNode,  // Optional: specify which node to use
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Request failed: ${response.statusText}`);
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

  // Helper method to get backend health status
  async getBackendHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.config.backendUrl}/health`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }
}

export const aiService = new AIService();
export type { AIMessage, AIStreamCallback, AIConfig, ComputeNode };

