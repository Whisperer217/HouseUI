import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { chatService } from '../services/chatService';
import { FamilyProfile, ChatMessage } from '../types';

interface ChatPanelProps {
  currentProfile: FamilyProfile;
}

export default function ChatPanel({ currentProfile }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const chatMessages = await chatService.getMessages();
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const newMessage = await chatService.sendMessage(
        currentProfile.id,
        userMessage,
        false
      );

      setMessages(prev => [...prev, newMessage]);

      const aiResponse = await generateAIResponse(userMessage);
      const aiMessage = await chatService.sendMessage(
        currentProfile.id,
        aiResponse,
        true
      );

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('game') || lowerInput.includes('play')) {
      return "I can help you create a game! Would you like to make a puzzle game, an adventure game, or something else? Tell me more about your idea.";
    } else if (lowerInput.includes('story') || lowerInput.includes('book')) {
      return "Writing a story is exciting! What kind of story interests you? Adventure, fantasy, mystery, or something else? I'm here to help you develop your ideas.";
    } else if (lowerInput.includes('art') || lowerInput.includes('draw')) {
      return "Art projects are wonderful! Are you thinking of digital art, a drawing, or something creative? Describe what you'd like to make.";
    } else if (lowerInput.includes('app') || lowerInput.includes('tool')) {
      return "Building an app sounds great! What kind of app do you want to create? A tool, a helper, or something for fun?";
    } else if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
      return "I can help you create games, apps, stories, and art! Just tell me what you'd like to make, or click Quick Create above to get started. What would you like to work on?";
    } else {
      return "That's interesting! Tell me more about your idea. I'm here to help you bring your creative projects to life. What would you like to create?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-400" />
          Family Chat
        </h2>
        <p className="text-sm text-gray-400 mt-1">Chat with AI and family members</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.is_ai ? 'justify-start' : 'justify-end'}`}
            >
              {msg.is_ai && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  msg.is_ai
                    ? 'bg-gray-700 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {!msg.is_ai && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: currentProfile.color }}
                >
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-700 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
