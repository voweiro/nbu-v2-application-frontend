import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMessages, sendMessage, Message } from '@/lib/features/admission/admissionSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Shield, MessageSquare } from 'lucide-react';

interface MessagesUIProps {
  applicationId?: string;
}

export default function MessagesUI({ applicationId }: MessagesUIProps) {
  const dispatch = useAppDispatch();
  const { messages, profile } = useAppSelector((state) => state.admission);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Always use 'general' key to view full history
  const lookupKey = 'general';
  const appMessages = useMemo(() => messages[lookupKey] || [], [messages, lookupKey]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
      // Fetch all messages (global history) instead of filtering by current application
      dispatch(fetchMessages(undefined));
      // Optional: Poll for new messages every 10 seconds
      const interval = setInterval(() => {
        dispatch(fetchMessages(undefined));
      }, 10000);
      return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [appMessages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    // Explicitly check for applicationId
    if (!applicationId) {
        console.error('Cannot send message: applicationId is missing');
        // You might want to show a toast/alert here
        return;
    }

    await dispatch(sendMessage({ 
        applicationId, 
        content: newMessage,
        receiverId: 'ADMISSION_OFFICE' // Default for applicant
    }));
    setNewMessage('');
  };

  const isOwnMessage = (msg: Message) => {
    // Check against profile ID (applicant) or User ID (auth)
    // Also check if senderId matches the applicantId stored in profile
    const userId = profile?.userId || profile?.applicantId;
    return msg.senderId === profile?.id || msg.senderId === userId;
  };

  return (
    <div className="w-full flex flex-col h-[700px] bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-red-500/5 overflow-hidden">
      {/* Chat Header */}
      <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800 shadow-inner">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Admission Support</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Office Online</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Registry ID:</span>
            <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-50">#ADM-SUPPORT-01</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-zinc-50/30 dark:bg-black/20">
        {appMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800">
               <MessageSquare className="w-10 h-10 text-zinc-300" />
            </div>
            <div>
              <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50">No Messages Yet</h4>
              <p className="text-sm text-zinc-500 font-medium max-w-xs mx-auto">Start a conversation with the Admission Office regarding your application status or requirements.</p>
            </div>
          </div>
        ) : (
          appMessages.map((msg, idx) => {
            const isMe = isOwnMessage(msg);
            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`flex gap-4 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    isMe 
                      ? 'bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                  }`}>
                    {isMe ? <User size={18} /> : <Shield size={18} />}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`p-4 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-red-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/60 dark:border-zinc-800/60'
                    }`}>
                      <p className="font-medium">{msg.content}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest block ${isMe ? 'text-right text-red-400' : 'text-zinc-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
        <div className="relative flex items-center">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message for the admission office..."
            className="h-16 pl-6 pr-20 bg-zinc-50 dark:bg-zinc-900/50 border-transparent focus:bg-white dark:focus:bg-zinc-900 border-2 focus:border-red-500/30 rounded-2xl text-base font-medium transition-all shadow-inner"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <div className="absolute right-2 px-2">
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-[0.2em] mt-3">Registry Communication Encrypted & Secured</p>
      </div>
    </div>
  );
}
