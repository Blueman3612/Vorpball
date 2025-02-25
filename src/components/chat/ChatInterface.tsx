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
  reply_to: string | null;
  reply_count?: number;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  threadLeagueName?: string;
  threadChannelName?: string;
}

interface TypingUser {
  user_id: string;
  username: string;
  channel_id: string;
  reply_to?: string | null;
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

// Helper function to format message timestamps
const formatMessageTime = (dateString: string) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  
  // Get hours and minutes in 12-hour format without leading zeros
  let hours = messageDate.getHours();
  const minutes = messageDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 hour to 12
  
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;
  
  // Check if the message is from today
  const isToday = messageDate.toDateString() === today.toDateString();
  
  if (isToday) {
    // For today's messages, just show hours and minutes
    return formattedTime;
  } else {
    // For older messages, include the date
    const formattedDate = messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Return both values for the component to handle
    return `${formattedDate} ${formattedTime}`;
  }
};

// Helper function to render the date part in bold
const formatTimestampWithBoldDate = (dateString: string) => {
  const formatted = formatMessageTime(dateString);
  const today = new Date().toDateString();
  const messageDate = new Date(dateString).toDateString();
  
  // If it's today's message, return as is
  if (today === messageDate) {
    return formatted;
  }
  
  // For older messages, split the string and make the date bold
  const parts = formatted.split(' ');
  // The date part is the first two parts (e.g., "Jan 15")
  const datePart = parts.slice(0, 2).join(' ');
  // The time part is the last two parts (e.g., "2:30 PM")
  const timePart = parts.slice(2).join(' ');
  
  return (
    <>
      <span className="font-medium">{datePart}</span> <span className="mx-0.5">·</span> {timePart}
    </>
  );
};

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
  const [threadTypingUsers, setThreadTypingUsers] = useState<TypingUser[]>([]);
  const lastTypedRef = useRef<number>(0);
  const lastThreadTypedRef = useRef<number>(0);
  const [leagueName, setLeagueName] = useState<string>("");
  
  // Thread-related state
  const [threadView, setThreadView] = useState<boolean>(false);
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadInput, setThreadInput] = useState('');
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSendingThreadReply, setIsSendingThreadReply] = useState(false);
  const threadMessagesEndRef = useRef<HTMLDivElement>(null);
  const threadInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom of thread messages
  const scrollThreadToBottom = () => {
    threadMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollThreadToBottom();
  }, [threadMessages]);

  // Add effect to fetch league name
  useEffect(() => {
    async function fetchLeagueName() {
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('name')
          .eq('id', leagueId)
          .single();

        if (error) throw error;
        setLeagueName(data.name);
      } catch (err) {
        console.error('Error fetching league name:', err);
      }
    }

    fetchLeagueName();
  }, [leagueId]);

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
          .select(`
            *,
            reply_count:channel_messages!reply_to(count)
          `)
          .eq('channel_id', currentChannel)
          .is('reply_to', null) // Only fetch top-level messages (not replies)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) throw messagesError;

        // Process the reply count from the Postgres aggregation
        const processedMessages = messagesData?.map(msg => ({
          ...msg,
          reply_count: msg.reply_count?.[0]?.count || 0
        }));

        // Then fetch profiles for these messages
        const userIds = [...new Set(processedMessages?.map(msg => msg.user_id) || [])];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Create a map of profiles by id for easy lookup
        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));
        
        // Transform the data to match our Message interface
        const typedMessages = (processedMessages || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          channel_id: msg.channel_id,
          reply_to: msg.reply_to,
          reply_count: msg.reply_count,
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
    reply_to: string | null;
  }>(
    {
      channel: `channel:${currentChannel}`,
      table: 'channel_messages',
      event: 'INSERT',
      filter: `channel_id=eq.${currentChannel}`,
      callback: async (payload) => {
        if (!payload.new || !('user_id' in payload.new)) return;
        const newMessage = payload.new;

        // Only add to messages if it's a top-level message
        if (newMessage.reply_to) {
          // If we're viewing this thread, add the reply to the thread
          if (activeThreadMessage && activeThreadMessage.id === newMessage.reply_to) {
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

            setThreadMessages(prev => [...prev, typedMessage]);
          }
          return;
        }
        
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
    [currentChannel, activeThreadMessage]
  );

  // Handle opening a thread
  const openThread = async (message: Message) => {
    setIsLoadingThread(true);
    setActiveThreadMessage(message);
    setThreadView(true);

    try {
      // Fetch thread replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('channel_messages')
        .select('*')
        .eq('reply_to', message.id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Fetch channel information for the thread message
      const { data: channelData, error: channelError } = await supabase
        .from('league_channels')
        .select('name, league_id')
        .eq('id', message.channel_id)
        .single();
      
      if (channelError) throw channelError;
      
      // Fetch league name if the channel is from a different league
      if (channelData.league_id !== leagueId) {
        const { data: threadLeagueData, error: threadLeagueError } = await supabase
          .from('leagues')
          .select('name')
          .eq('id', channelData.league_id)
          .single();
          
        if (!threadLeagueError && threadLeagueData) {
          // Store thread-specific league name and channel name
          message.threadLeagueName = threadLeagueData.name;
          message.threadChannelName = channelData.name;
        }
      } else {
        // Use current league name but store the correct channel name
        message.threadLeagueName = leagueName;
        message.threadChannelName = channelData.name;
      }

      // Fetch user profiles for replies
      const userIds = [...new Set(repliesData?.map(msg => msg.user_id) || [])];
      if (userIds.length === 0) {
        setThreadMessages([]);
        setIsLoadingThread(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create profile lookup map
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));

      // Transform to typed messages
      const typedReplies = (repliesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        channel_id: msg.channel_id,
        reply_to: msg.reply_to,
        reply_count: msg.reply_count,
        user: profilesMap.get(msg.user_id)!
      })) as Message[];

      setThreadMessages(typedReplies);
    } catch (err) {
      console.error('Error fetching thread replies:', err);
    } finally {
      setIsLoadingThread(false);
    }
  };

  // Close thread view
  const closeThread = () => {
    setThreadView(false);
    setActiveThreadMessage(null);
    setThreadMessages([]);
    setThreadInput('');
  };

  // Send a reply in a thread
  const handleSendThreadReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!threadInput.trim() || !activeThreadMessage || isSendingThreadReply) return;

    try {
      setIsSendingThreadReply(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setError('You must be logged in to send messages.');
        return;
      }

      // Clear typing indicator for this user immediately
      setThreadTypingUsers(prev => prev.filter(u => u.user_id !== user.id));

      // Send stop typing broadcast for thread
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
              reply_to: activeThreadMessage.id,
              last_typed: new Date().toISOString()
            }
          });
        }
      } catch (err) {
        console.error('Error sending stop typing broadcast for thread:', err);
      }

      const { error: sendError } = await supabase
        .from('channel_messages')
        .insert({
          content: threadInput.trim(),
          channel_id: activeThreadMessage.channel_id,
          user_id: user.id,
          reply_to: activeThreadMessage.id
        });

      if (sendError) throw sendError;

      // Update the reply count in the UI without refetching everything
      if (activeThreadMessage) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === activeThreadMessage.id 
              ? { ...msg, reply_count: (msg.reply_count || 0) + 1 }
              : msg
          )
        );
      }

      setThreadInput('');
      lastThreadTypedRef.current = 0;
      threadInputRef.current?.focus();
    } catch (err) {
      console.error('Error sending thread reply:', err);
    } finally {
      setIsSendingThreadReply(false);
    }
  };

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
      .on('broadcast' as 'system', { event: 'typing' }, (payload: BroadcastEvent) => {
        // Don't show typing indicator for current user
        if (currentUserId && payload.payload.user_id === currentUserId) return;
        
        // Check if this is a thread typing event
        if (payload.payload.reply_to) {
          setThreadTypingUsers(prev => {
            const now = Date.now();
            const filtered = prev.filter(user => 
              user.user_id !== payload.payload.user_id && 
              now - new Date(user.last_typed).getTime() < 3000
            );
            return [...filtered, payload.payload];
          });
        } else {
          setTypingUsers(prev => {
            const now = Date.now();
            const filtered = prev.filter(user => 
              user.user_id !== payload.payload.user_id && 
              now - new Date(user.last_typed).getTime() < 3000
            );
            return [...filtered, payload.payload];
          });
        }
      })
      .on('broadcast' as 'system', { event: 'stop_typing' }, (payload: BroadcastEvent) => {
        // Don't process stop typing for current user (handled in send message)
        if (currentUserId && payload.payload.user_id === currentUserId) return;
        
        if (payload.payload.reply_to) {
          setThreadTypingUsers(prev => prev.filter(user => user.user_id !== payload.payload.user_id));
        } else {
          setTypingUsers(prev => prev.filter(user => user.user_id !== payload.payload.user_id));
        }
      })
      .subscribe();

    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        return prev.filter(user => 
          now - new Date(user.last_typed).getTime() < 3000
        );
      });
      setThreadTypingUsers(prev => {
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

  // Update the typing status function for threads
  const updateThreadTypingStatus = async () => {
    const now = Date.now();
    if (now - lastThreadTypedRef.current < 1000) return;
    lastThreadTypedRef.current = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !currentChannel || !activeThreadMessage) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (!profile?.username) return;

      // Get the channel instance
      const channel = supabase.channel(`typing:${currentChannel}`);

      // Broadcast typing status with thread info
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.id,
          username: profile.username,
          channel_id: currentChannel,
          reply_to: activeThreadMessage.id,
          last_typed: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error updating thread typing status:', err);
    }
  };

  // Update the typing status function for the main chat
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
          user_id: user.id,
          reply_to: null // Explicitly set to null for top-level messages
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
        <div className={cn(
          "flex-1 flex flex-col",
          threadView && "md:w-[60%]"
        )}>
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
                    <div key={message.id} className="flex gap-3 group">
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
                      <div className="flex-1">
                        {showHeader && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {message.user.username}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestampWithBoldDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start">
                          <p className={cn(
                            "text-gray-800 dark:text-gray-200",
                            !showHeader && "pt-0"
                          )}>{message.content}</p>
                          
                          <div className="flex items-center gap-2 ml-2">
                            <button 
                              onClick={() => openThread(message)}
                              className={cn(
                                "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-opacity flex items-center gap-1",
                                (message.reply_count ?? 0) > 0 
                                  ? "bg-gray-100/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300" 
                                  : "text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100"
                              )}
                              aria-label="Reply in thread"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {(message.reply_count ?? 0) > 0 && (
                                <span className="text-xs font-medium">{message.reply_count}</span>
                              )}
                            </button>
                          </div>
                        </div>
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

        {/* Thread panel */}
        {threadView && (
          <div className="hidden md:flex flex-col w-[40%] border-l border-gray-300/50 dark:border-gray-700/30">
            {/* Thread header */}
            <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeThreadMessage?.threadLeagueName || leagueName}
                  </h3>
                  <span className="text-gray-600 dark:text-gray-400">
                    • #{activeThreadMessage?.threadChannelName || channels.find(c => c.id === currentChannel)?.name}
                  </span>
                </div>
                <button 
                  onClick={closeThread} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close thread"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Original message */}
            {activeThreadMessage && (
              <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {activeThreadMessage.user.avatar_url ? (
                        <Image
                          src={activeThreadMessage.user.avatar_url}
                          alt={activeThreadMessage.user.username}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          {activeThreadMessage.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activeThreadMessage.user.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestampWithBoldDate(activeThreadMessage.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{activeThreadMessage.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Thread replies */}
            <CustomScrollArea className="flex-1 p-4">
              {isLoadingThread ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : threadMessages.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  {t('common.chat.noReplies')}
                </div>
              ) : (
                <div className="space-y-3">
                  {threadMessages.map((message, index) => {
                    const previousMessage = index > 0 ? threadMessages[index - 1] : null;
                    const showHeader = 
                      !previousMessage || 
                      previousMessage.user_id !== message.user_id ||
                      new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 60000;

                    return (
                      <div key={message.id} className="flex gap-3">
                        {showHeader ? (
                          <div className="flex-shrink-0 relative top-1">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              {message.user.avatar_url ? (
                                <Image
                                  src={message.user.avatar_url}
                                  alt={message.user.username}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                  {message.user.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-6 flex-shrink-0" />
                        )}
                        <div>
                          {showHeader && (
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {message.user.username}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestampWithBoldDate(message.created_at)}
                              </span>
                            </div>
                          )}
                          <p className={cn(
                            "text-gray-800 dark:text-gray-200 text-sm",
                            !showHeader && "pt-0"
                          )}>{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadMessagesEndRef} />
                </div>
              )}
            </CustomScrollArea>

            {/* Thread input */}
            <div className="p-4 border-t border-gray-300/50 dark:border-gray-700/30">
              {threadTypingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce [animation-delay:0.2s]">•</span>
                    <span className="animate-bounce [animation-delay:0.4s]">•</span>
                  </div>
                  <span>
                    {threadTypingUsers.length === 1 
                      ? t('common.chat.typingIndicator.single', { username: threadTypingUsers[0].username })
                      : threadTypingUsers.length === 2
                      ? t('common.chat.typingIndicator.double', { 
                          username1: threadTypingUsers[0].username,
                          username2: threadTypingUsers[1].username 
                        })
                      : t('common.chat.typingIndicator.multiple', { count: threadTypingUsers.length })}
                  </span>
                </div>
              )}
              {!canPost ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  {t('common.errors.noPostPermission')}
                </div>
              ) : (
                <form onSubmit={handleSendThreadReply}>
                  <div className="relative">
                    <input
                      ref={threadInputRef}
                      type="text"
                      placeholder={t('common.actions.replyInThread')}
                      value={threadInput}
                      onChange={(e) => {
                        setThreadInput(e.target.value);
                        updateThreadTypingStatus();
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
                        isSendingThreadReply && 'opacity-50 cursor-not-allowed'
                      )}
                      disabled={isSendingThreadReply}
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Mobile thread view (dialog/modal for small screens) */}
        {threadView && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col max-h-[90vh]">
              {/* Thread header */}
              <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeThreadMessage?.threadLeagueName || leagueName}
                    </h3>
                    <span className="text-gray-600 dark:text-gray-400">
                      • #{activeThreadMessage?.threadChannelName || channels.find(c => c.id === currentChannel)?.name}
                    </span>
                  </div>
                  <button 
                    onClick={closeThread} 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Close thread"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Original message */}
              {activeThreadMessage && (
                <div className="p-4 border-b border-gray-300/50 dark:border-gray-700/30">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {activeThreadMessage.user.avatar_url ? (
                          <Image
                            src={activeThreadMessage.user.avatar_url}
                            alt={activeThreadMessage.user.username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                            {activeThreadMessage.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activeThreadMessage.user.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestampWithBoldDate(activeThreadMessage.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">{activeThreadMessage.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thread replies */}
              <CustomScrollArea className="flex-1 p-4">
                {isLoadingThread ? (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                ) : threadMessages.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                    {t('common.chat.noReplies')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {threadMessages.map((message, index) => {
                      const previousMessage = index > 0 ? threadMessages[index - 1] : null;
                      const showHeader = 
                        !previousMessage || 
                        previousMessage.user_id !== message.user_id ||
                        new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 60000;

                      return (
                        <div key={message.id} className="flex gap-3">
                          {showHeader ? (
                            <div className="flex-shrink-0 relative top-1">
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                {message.user.avatar_url ? (
                                  <Image
                                    src={message.user.avatar_url}
                                    alt={message.user.username}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                    {message.user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="w-6 flex-shrink-0" />
                          )}
                          <div>
                            {showHeader && (
                              <div className="flex items-baseline gap-2">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {message.user.username}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimestampWithBoldDate(message.created_at)}
                                </span>
                              </div>
                            )}
                            <p className={cn(
                              "text-gray-800 dark:text-gray-200 text-sm",
                              !showHeader && "pt-0"
                            )}>{message.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadMessagesEndRef} />
                  </div>
                )}
              </CustomScrollArea>

              {/* Thread input */}
              <div className="p-4 border-t border-gray-300/50 dark:border-gray-700/30">
                {!canPost ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    {t('common.errors.noPostPermission')}
                  </div>
                ) : (
                  <form onSubmit={handleSendThreadReply}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('common.actions.replyInThread')}
                        value={threadInput}
                        onChange={(e) => setThreadInput(e.target.value)}
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
                          isSendingThreadReply && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={isSendingThreadReply}
                      />
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 