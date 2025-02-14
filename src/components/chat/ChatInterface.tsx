import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';
import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription';
import { useTranslations } from '@/lib/i18n';
import Image from 'next/image';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: 'text' | 'announcement';
  position: number;
  permissions: 'everyone' | 'admin';
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

interface TypingUser {
  user_id: string;
  username: string;
  channel_id: string;
  last_typed: string;
}

interface BroadcastEvent {
  type: 'broadcast';
  event: 'typing' | 'stop_typing';
  payload: TypingUser;
}

interface ChatInterfaceProps {
  leagueId: string;
  className?: string;
}

export function ChatInterface({ leagueId, className }: ChatInterfaceProps) {
  const { t } = useTranslations();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userRole, setUserRole] = useState<'member' | 'admin' | null>(null);
  const [canPost, setCanPost] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const lastTypedRef = useRef<number>(0);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add effect to fetch user role
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await supabase
          .from('league_members')
          .select('role')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserRole(data.role);
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    }

    fetchUserRole();
  }, [leagueId]);

  // Function to check if user can post in current channel
  const canPostInChannel = useCallback((channel: Channel) => {
    if (!channel || !userRole) return false;
    return channel.permissions === 'everyone' || (channel.permissions === 'admin' && userRole === 'admin');
  }, [userRole]);

  // Update canPost when channel or userRole changes
  useEffect(() => {
    if (currentChannel) {
      const channel = channels.find(c => c.id === currentChannel);
      if (channel) {
        setCanPost(canPostInChannel(channel));
      }
    }
  }, [currentChannel, channels, canPostInChannel]);

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

        if (channelsError) throw channelsError;

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('league_members')
          .select('role')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        if (roleError) throw roleError;

        setUserRole(roleData?.role || null);
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

  // Add effect to fetch initial messages when channel changes
  useEffect(() => {
    if (!currentChannel) return;

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
  }, [currentChannel]);

  // Replace the message subscription effect with useRealtimeSubscription
  useRealtimeSubscription<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    channel_id: string;
  }>(
    {
      channel: `channel:${currentChannel}`,
      table: 'channel_messages',
      event: 'INSERT',
      filter: `channel_id=eq.${currentChannel}`,
      callback: async (payload) => {
        if (!payload.new || !('user_id' in payload.new)) return;
        const newMessage = payload.new;
        
        // Fetch the user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', newMessage.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // Transform the data to match our Message interface
        const typedMessage = {
          ...newMessage,
          user: profileData
        } as Message;

        setMessages(prev => [...prev, typedMessage]);
      }
    },
    [currentChannel]
  );

  // Update the typing events subscription
  useEffect(() => {
    if (!currentChannel) return;

    const channel = supabase.channel(`typing:${currentChannel}`, {
      config: {
        broadcast: { self: false }
      }
    });

    // Get current user ID once for the subscription
    const getCurrentUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    };

    let currentUserId: string | undefined;
    getCurrentUserId().then(id => {
      currentUserId = id;
    });

    channel
      .on('broadcast', { event: 'typing' }, (payload: { type: 'broadcast', event: string, payload: TypingUser }) => {
        // Don't show typing indicator for current user
        if (currentUserId && payload.payload.user_id === currentUserId) return;
        
        setTypingUsers(prev => {
          const now = Date.now();
          const filtered = prev.filter(user => 
            user.user_id !== payload.payload.user_id && 
            now - new Date(user.last_typed).getTime() < 3000
          );
          return [...filtered, payload.payload];
        });
      })
      .on('broadcast', { event: 'stop_typing' }, (payload: { type: 'broadcast', event: string, payload: TypingUser }) => {
        // Don't process stop typing for current user (handled in send message)
        if (currentUserId && payload.payload.user_id === currentUserId) return;
        
        setTypingUsers(prev => prev.filter(user => user.user_id !== payload.payload.user_id));
      })
      .subscribe();

    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        return prev.filter(user => 
          now - new Date(user.last_typed).getTime() < 3000
        );
      });
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      channel.unsubscribe();
    };
  }, [currentChannel]);

  // Update the typing status function
  const updateTypingStatus = async () => {
    const now = Date.now();
    if (now - lastTypedRef.current < 1000) return;
    lastTypedRef.current = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !currentChannel) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (!profile?.username) return;

      // Get the channel instance
      const channel = supabase.channel(`typing:${currentChannel}`);

      // Broadcast typing status
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.id,
          username: profile.username,
          channel_id: currentChannel,
          last_typed: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !currentChannel || isSending) return;

    try {
      setIsSending(true);
      const currentInput = inputRef.current;
      const selectionStart = currentInput?.selectionStart;
      const selectionEnd = currentInput?.selectionEnd;
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setError('You must be logged in to send messages.');
        return;
      }

      // Clear typing indicator for this user immediately
      setTypingUsers(prev => prev.filter(u => u.user_id !== user.id));

      // Send stop typing broadcast
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profile?.username) {
          const channel = supabase.channel(`typing:${currentChannel}`);
          await channel.send({
            type: 'broadcast',
            event: 'stop_typing',
            payload: {
              user_id: user.id,
              username: profile.username,
              channel_id: currentChannel,
              last_typed: new Date().toISOString()
            }
          });
        }
      } catch (err) {
        console.error('Error sending stop typing broadcast:', err);
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
      // Reset last typed time to prevent immediate typing indicator after sending
      lastTypedRef.current = 0;
      
      // Ensure input maintains focus and restore cursor position
      requestAnimationFrame(() => {
        currentInput?.focus();
        if (selectionStart) currentInput.selectionStart = 0;
        if (selectionEnd) currentInput.selectionEnd = 0;
      });
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
          <p className="text-gray-500 dark:text-gray-400">{t('common.states.loadingChannels')}</p>
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
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{t('common.chat.channels')}</h3>
          </div>
          <CustomScrollArea className="h-[calc(100%-4rem)]">
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
          </CustomScrollArea>
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
          <CustomScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('common.chat.noMessages')}
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => {
                  const previousMessage = index > 0 ? messages[index - 1] : null;
                  const showHeader = 
                    !previousMessage || 
                    previousMessage.user_id !== message.user_id ||
                    new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 60000;

                  return (
                    <div key={message.id} className="flex gap-3">
                      {showHeader ? (
                        <div className="flex-shrink-0 relative top-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {message.user.avatar_url ? (
                              <Image
                                src={message.user.avatar_url}
                                alt={message.user.username}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                {message.user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      <div>
                        {showHeader && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {message.user.username}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        <p className={cn(
                          "text-gray-800 dark:text-gray-200",
                          !showHeader && "pt-0"
                        )}>{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CustomScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-300/50 dark:border-gray-700/30">
            {currentChannel && channels.find(c => c.id === currentChannel) && (
              <>
                {/* Move typing indicator here, above the input */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex gap-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce [animation-delay:0.2s]">•</span>
                      <span className="animate-bounce [animation-delay:0.4s]">•</span>
                    </div>
                    <span>
                      {typingUsers.length === 1 
                        ? t('common.chat.typingIndicator.single', { username: typingUsers[0].username })
                        : typingUsers.length === 2
                        ? t('common.chat.typingIndicator.double', { 
                            username1: typingUsers[0].username,
                            username2: typingUsers[1].username 
                          })
                        : t('common.chat.typingIndicator.multiple', { count: typingUsers.length })}
                    </span>
                  </div>
                )}
                {!canPost ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    {t('common.errors.noPostPermission')}
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage}>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('common.actions.sendMessage')}
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          updateTypingStatus();
                        }}
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 