import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';

export const chatService = {
  async getMessages(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async sendMessage(
    userId: string,
    message: string,
    isAi: boolean = false
  ): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message,
        is_ai: isAi,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
