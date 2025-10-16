interface Thread {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  type: string;
  is_pinned: boolean;
  updated_at: string;
}

interface Message {
  id: string;
  thread_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  mentions: string[];
  has_files: boolean;
  reply_to: string | null;
  created_at: string;
  message_type?: string;
  code_language?: string;
  voice_duration?: number;
  is_pinned?: boolean;
  reactions?: any;
}

const DEFAULT_THREADS: Thread[] = [
  {
    id: 'general',
    name: 'General Chat',
    description: 'Family chat room',
    icon: '💬',
    color: '#3b82f6',
    type: 'chat',
    is_pinned: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ai-helper',
    name: 'AI Helper',
    description: 'Chat with AI assistant',
    icon: '🤖',
    color: '#10b981',
    type: 'ai',
    is_pinned: true,
    updated_at: new Date().toISOString(),
  },
];

export const localChatService = {
  getThreads(): Thread[] {
    const saved = localStorage.getItem('chat_threads');
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem('chat_threads', JSON.stringify(DEFAULT_THREADS));
    return DEFAULT_THREADS;
  },

  getMessages(threadId: string): Message[] {
    const saved = localStorage.getItem(`thread_messages_${threadId}`);
    return saved ? JSON.parse(saved) : [];
  },

  saveMessage(message: Omit<Message, 'id' | 'created_at'>): Message {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      created_at: new Date().toISOString(),
    };

    const messages = this.getMessages(message.thread_id);
    messages.push(newMessage);
    localStorage.setItem(`thread_messages_${message.thread_id}`, JSON.stringify(messages));

    return newMessage;
  },

  updateMessage(messageId: string, threadId: string, updates: Partial<Message>): void {
    const messages = this.getMessages(threadId);
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updates };
      localStorage.setItem(`thread_messages_${threadId}`, JSON.stringify(messages));
    }
  },
};
