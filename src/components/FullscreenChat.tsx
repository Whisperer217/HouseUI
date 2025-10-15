import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Minimize2,
  Hash,
  AtSign,
  Bot,
  Pin,
  Search,
  Plus,
  X,
  Reply,
  Image as ImageIcon,
  File,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FamilyProfile } from '../types';

interface Thread {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  type: string;
  is_pinned: boolean;
  updated_at: string;
  unread_count?: number;
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
  files?: MessageFile[];
}

interface MessageFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url: string | null;
}

interface FullscreenChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: FamilyProfile;
  familyProfiles: FamilyProfile[];
}

export default function FullscreenChat({
  isOpen,
  onClose,
  currentProfile,
  familyProfiles,
}: FullscreenChatProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadThreads();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      markThreadAsRead(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setThreads(data);
        if (data.length > 0 && !selectedThread) {
          setSelectedThread(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('thread_messages')
        .select('*, message_files(*)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(
          data.map((msg: any) => ({
            ...msg,
            files: msg.message_files || [],
          }))
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    try {
      await supabase
        .from('thread_members')
        .upsert({
          thread_id: threadId,
          user_id: currentProfile.id,
          last_read_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && uploadedFiles.length === 0) return;
    if (!selectedThread) return;

    try {
      const mentions = extractMentions(messageInput);

      const { data: newMessage, error } = await supabase
        .from('thread_messages')
        .insert({
          thread_id: selectedThread.id,
          user_id: currentProfile.id,
          user_name: currentProfile.name,
          user_avatar: currentProfile.avatar,
          content: messageInput,
          mentions: mentions,
          has_files: uploadedFiles.length > 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (uploadedFiles.length > 0 && newMessage) {
        for (const file of uploadedFiles) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            await supabase.from('message_files').insert({
              message_id: newMessage.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              file_url: e.target?.result as string,
              uploaded_by: currentProfile.id,
            });
          };
          reader.readAsDataURL(file);
        }
      }

      setMessageInput('');
      setUploadedFiles([]);
      loadMessages(selectedThread.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1].toLowerCase();
      const profile = familyProfiles.find(
        (p) => p.name.toLowerCase() === mentionedName
      );
      if (profile) {
        mentions.push(profile.id);
      }
    }

    return mentions;
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);

    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionFilter('');
    } else if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowMentions(true);
        setMentionFilter(afterAt.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (profile: FamilyProfile) => {
    const lastAtIndex = messageInput.lastIndexOf('@');
    const beforeAt = messageInput.slice(0, lastAtIndex);
    setMessageInput(`${beforeAt}@${profile.name} `);
    setShowMentions(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const filteredThreads = threads.filter((thread) =>
    thread.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = familyProfiles.filter((profile) =>
    profile.name.toLowerCase().includes(mentionFilter)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Family Chat</h1>
            <p className="text-sm text-gray-400">Stay connected and collaborate</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Minimize2 className="w-5 h-5" />
          Minimize
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full p-4 text-left border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                  selectedThread?.id === thread.id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="text-2xl p-2 rounded-lg"
                    style={{ backgroundColor: `${thread.color}20` }}
                  >
                    {thread.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {thread.name}
                      </h3>
                      {thread.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                      {thread.type === 'ai' && <Bot className="w-4 h-4 text-blue-400" />}
                    </div>
                    {thread.description && (
                      <p className="text-sm text-gray-400 truncate">
                        {thread.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all">
              <Plus className="w-5 h-5" />
              New Thread
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedThread ? (
            <>
              <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div
                    className="text-2xl p-2 rounded-lg"
                    style={{ backgroundColor: `${selectedThread.color}20` }}
                  >
                    {selectedThread.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedThread.name}
                    </h2>
                    {selectedThread.description && (
                      <p className="text-sm text-gray-400">
                        {selectedThread.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.user_id === currentProfile.id;
                  const isMentioned = message.mentions.includes(currentProfile.id);

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''} ${
                        isMentioned ? 'bg-yellow-500/10 -mx-6 px-6 py-2 rounded-lg' : ''
                      }`}
                    >
                      <div className="text-2xl">{message.user_avatar}</div>
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">
                            {message.user_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className={`inline-block px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          {message.content}
                        </div>
                        {message.files && message.files.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg"
                              >
                                {file.file_type.startsWith('image/') ? (
                                  <ImageIcon className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <File className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-white">
                                  {file.file_name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-gray-800 border-t border-gray-700">
                {uploadedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg"
                      >
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showMentions && (
                  <div className="mb-3 p-2 bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">Mention someone:</div>
                    <div className="space-y-1">
                      {filteredProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => insertMention(profile)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <span className="text-xl">{profile.avatar}</span>
                          <span className="text-white">{profile.name}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => insertMention({ id: 'ai', name: 'AI', avatar: '🤖', color: '#f59e0b' })}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Bot className="w-5 h-5 text-blue-400" />
                        <span className="text-white">AI Assistant</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-400" />
                  </button>
                  <textarea
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message... (@mention someone or @AI)"
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Select a thread to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
