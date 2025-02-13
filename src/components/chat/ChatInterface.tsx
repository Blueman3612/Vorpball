import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: 'text' | 'announcement';
  position: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ChatInterfaceProps {
  leagueId: string;
  className?: string;
}

export function ChatInterface({ leagueId, className }: ChatInterfaceProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch channels on mount
  useEffect(() => {
    async function fetchChannels() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('You must be logged in to view channels.');
          return;
        }

        // Fetch channels
        const { data: channelsData, error: channelsError } = await supabase
          .from('league_channels')
          .select('*')
          .eq('league_id', leagueId)
          .order('position');

        if (channelsError) {
          console.error('Error fetching channels:', channelsError);
          setError('Failed to load channels. Please try again later.');
          return;
        }

        setError(null);
        setChannels(channelsData || []);
        
        // Find and select the general channel by default
        const generalChannel = channelsData?.find(c => c.name === 'general');
        if (generalChannel) {
          setCurrentChannel(generalChannel.id);
        } else if (channelsData && channelsData.length > 0) {
          // Fallback to first channel if no general channel exists
          setCurrentChannel(channelsData[0].id);
        }
      } catch (err) {
        console.error('Error in fetchChannels:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChannels();
  }, [leagueId]);

  // Fetch messages and subscribe to new ones when channel changes
  useEffect(() => {
    if (!currentChannel) return;

    // Fetch existing messages
    async function fetchMessages() {
      try {
        // First fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('channel_messages')
          .select('*')
          .eq('channel_id', currentChannel)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) throw messagesError;

        // Then fetch profiles for these messages
        const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Create a map of profiles by id for easy lookup
        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));
        
        // Transform the data to match our Message interface
        const typedMessages = (messagesData || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          channel_id: msg.channel_id,
          user: profilesMap.get(msg.user_id)!
        })) as Message[];
        
        setMessages(typedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`channel:${currentChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${currentChannel}`
        },
        async (payload) => {
          // Fetch the complete message
          const { data: messageData, error: messageError } = await supabase
            .from('channel_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (messageError) {
            console.error('Error fetching new message:', messageError);
            return;
          }

          // Fetch the user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', messageData.user_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }

          // Transform the data to match our Message interface
          const typedMessage = {
            id: messageData.id,
            content: messageData.content,
            created_at: messageData.created_at,
            user_id: messageData.user_id,
            channel_id: messageData.channel_id,
            user: profileData
          } as Message;

          setMessages(prev => [...prev, typedMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !currentChannel || isSending) return;

    try {
      setIsSending(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setError('You must be logged in to send messages.');
        return;
      }

      const { error: sendError } = await supabase
        .from('channel_messages')
        .insert({
          content: messageInput.trim(),
          channel_id: currentChannel,
          user_id: user.id
        });

      if (sendError) throw sendError;

      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-error-500 mb-2">
            <svg className="h-8 w-8 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", className)}>
      <div className="w-full h-full flex rounded-lg border border-gray-300/50 dark:border-gray-700/30 overflow-hidden bg-white/10 dark:bg-gray-900/20">
        {/* Channels Sidebar */}
        <div className="w-60 flex-shrink-0 border-r border-gray-300/50 dark:border-gray-700/30">
          <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/30">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Channels</h3>
          </div>
          <div className="overflow-y-auto">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setCurrentChannel(channel.id)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  'flex items-center gap-2',
                  channel.id === currentChannel
                    ? 'bg-gray-100/50 dark:bg-gray-700/30 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/30 dark:hover:bg-gray-700/20'
                )}
              >
                {channel.type === 'announcement' ? (
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                )}
                # {channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          {currentChannel && (
            <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/30">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  # {channels.find(c => c.id === currentChannel)?.name}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {channels.find(c => c.id === currentChannel)?.description}
                </span>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No messages yet
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      {message.user.avatar_url ? (
                        <img
                          src={message.user.avatar_url}
                          alt={message.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          {message.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {message.user.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-300/50 dark:border-gray-700/30">
            <form onSubmit={handleSendMessage}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2 rounded-md',
                    'bg-gray-100/50 dark:bg-gray-800/50',
                    'border border-gray-300/50 dark:border-gray-600/30',
                    'hover:border-gray-400/50 dark:hover:border-gray-500/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                    'focus:border-primary-500/50',
                    'transition-colors duration-200',
                    isSending && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={isSending}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 