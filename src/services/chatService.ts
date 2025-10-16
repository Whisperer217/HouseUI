import { ChatMessage } from '../types';

export const chatService = {
  getMessages(): ChatMessage[] {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  },

  sendMessage(
    userId: string,
    message: string,
    isAi: boolean = false
  ): ChatMessage {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_id: userId,
      message,
      is_ai: isAi,
      created_at: new Date().toISOString(),
    };

    const messages = this.getMessages();
    const updatedMessages = [...messages, newMessage];
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));

    return newMessage;
  },

  clearMessages(): void {
    localStorage.removeItem('chat_messages');
  },
};
