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
  endpointType?: 'ollama' | 'openwebui' | 'custom';
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

const DEFAULT_CONFIG: AIConfig = {
  endpoint: 'http://localhost:11434',
  model: 'qwen3:8b',
  temperature: 0.7,
  maxTokens: 2000,
  endpointType: 'ollama',
};

const PRESET_NODES: ComputeNode[] = [
  {
    id: 'local-ollama',
    name: 'Local Ollama',
    endpoint: 'http://localhost:11434',
    type: 'ollama',
    isOnline: false,
    models: [],
    location: 'local',
  },
];

class AIService {
  private config: AIConfig;
  private computeNodes: ComputeNode[] = [];

  constructor() {
    const savedConfig = localStorage.getItem('ai_config');
    this.config = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;

    const savedNodes = localStorage.getItem('compute_nodes');
    this.computeNodes = savedNodes ? JSON.parse(savedNodes) : [...PRESET_NODES];
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

  async addComputeNode(node: Omit<ComputeNode, 'id' | 'isOnline' | 'models'>) {
    const newNode: ComputeNode = {
      ...node,
      id: `node-${Date.now()}`,
      isOnline: false,
      models: [],
    };

    const isOnline = await this.checkNodeConnection(newNode.endpoint, newNode.type);
    newNode.isOnline = isOnline;

    if (isOnline) {
      newNode.models = await this.fetchNodeModels(newNode.endpoint, newNode.type);
    }

    this.computeNodes.push(newNode);
    localStorage.setItem('compute_nodes', JSON.stringify(this.computeNodes));
    return newNode;
  }

  async removeComputeNode(nodeId: string) {
    this.computeNodes = this.computeNodes.filter((n) => n.id !== nodeId);
    localStorage.setItem('compute_nodes', JSON.stringify(this.computeNodes));
  }

  async refreshComputeNodes() {
    for (const node of this.computeNodes) {
      node.isOnline = await this.checkNodeConnection(node.endpoint, node.type);
      if (node.isOnline) {
        node.models = await this.fetchNodeModels(node.endpoint, node.type);
      } else {
        node.models = [];
      }
    }
    localStorage.setItem('compute_nodes', JSON.stringify(this.computeNodes));
  }

  async checkNodeConnection(endpoint: string, type: string): Promise<boolean> {
    try {
      const testPath = type === 'openwebui' ? '/api/v1/models' : '/api/tags';
      const response = await fetch(`${endpoint}${testPath}`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async fetchNodeModels(endpoint: string, type: string): Promise<string[]> {
    try {
      const apiPath = type === 'openwebui' ? '/api/v1/models' : '/api/tags';
      const response = await fetch(`${endpoint}${apiPath}`);
      if (!response.ok) return [];

      const data = await response.json();

      if (type === 'openwebui') {
        return data.data?.map((m: any) => m.id || m.name) || [];
      } else {
        return data.models?.map((m: any) => m.name) || [];
      }
    } catch (error) {
      return [];
    }
  }

  async checkConnection(): Promise<boolean> {
    return this.checkNodeConnection(this.config.endpoint, this.config.endpointType || 'ollama');
  }

  async listModels(): Promise<string[]> {
    return this.fetchNodeModels(this.config.endpoint, this.config.endpointType || 'ollama');
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
      const endpointType = this.config.endpointType || 'ollama';

      if (endpointType === 'openwebui') {
        await this.generateOpenWebUIResponse(allMessages, callbacks);
      } else {
        await this.generateOllamaResponse(allMessages, callbacks);
      }
    } catch (error) {
      callbacks.onError(error as Error);
    }
  }

  private async generateOllamaResponse(
    messages: AIMessage[],
    callbacks: AIStreamCallback
  ): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
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
  }

  private async generateOpenWebUIResponse(
    messages: AIMessage[],
    callbacks: AIStreamCallback
  ): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        stream: true,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
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
      const lines = chunk.split('\n').filter((line) => line.trim() && line.startsWith('data: '));

      for (const line of lines) {
        try {
          const jsonStr = line.replace('data: ', '');
          if (jsonStr === '[DONE]') {
            callbacks.onComplete(fullResponse);
            return;
          }

          const json = JSON.parse(jsonStr);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            callbacks.onToken(content);
          }
        } catch (e) {
          console.warn('Error parsing SSE line:', e);
        }
      }
    }

    callbacks.onComplete(fullResponse);
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
export type { AIMessage, AIStreamCallback, AIConfig, ComputeNode };
