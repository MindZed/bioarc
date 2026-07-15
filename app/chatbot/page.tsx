// app/chatbot/page.tsx
// This file will be used to create the chatbot page

"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Send, MessageSquarePlus, BrainCircuit, Zap, Bot, User, Activity, Loader2, Trash2, Mic } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { VoiceChatModal } from '@/components/chatbot/VoiceChatModal';

export default function ChatbotPage() {
  const {
    chatHistory, activeSessionId, fastMode,
    setActiveSession, createNewSession, toggleFastMode, telemetry, fsm, setChatHistory, deleteSession, updateSessionTitle
  } = useStore();

  // --- Vercel AI SDK v4 Integration ---
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat?sessionId=${activeSessionId || ''}`
    }),
    onFinish: (event) => console.log('[CLIENT] ✅ Stream finished.', event.message?.id),
    onError: (err) => console.error('[CLIENT] ❌ SDK Error:', err),
  });
  const isLoading = status === 'submitted' || status === 'streaming';
  // ------------------------------------

  const [input, setInput] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Fetch live chat history from Prisma
  useEffect(() => {
    fetch('/api/chat/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          // Format timestamps to match existing UI
          const formattedSessions = data.sessions.map((s: any) => ({
            id: s.id,
            title: s.title,
            date: new Date(s.createdAt).toLocaleDateString(),
            messages: s.messages,
          }));
          setChatHistory(formattedSessions);
        }
      })
      .catch((err) => console.error('Failed to fetch history:', err));
  }, [setChatHistory]);

  // Hydrate Vercel AI SDK ONLY when switching sessions, not when history updates in the background
  useEffect(() => {
    if (activeSessionId) {
      const session = chatHistory.find((s) => s.id === activeSessionId);
      if (session && session.messages) {
        const formattedMessages = session.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          parts: [{ type: 'text', text: msg.content }], // Ensures rendering works perfectly with existing UI code
        }));
        setMessages(formattedMessages as any); // Type cast necessary here due to SDK mapping differences
      } else {
        setMessages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, setMessages]);

  useEffect(() => {
    setMounted(true);
    if (chatHistory.length > 0 && !activeSessionId) {
      setActiveSession(chatHistory[0].id);
    }
  }, [chatHistory, activeSessionId, setActiveSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeSessionId]);

  if (!mounted) return null;

  const activeSession = chatHistory.find(s => s.id === activeSessionId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId || isLoading) return;

    // Trigger the real AI API and explicitly pass the activeSessionId to prevent duplicate sessions
    console.log('[CLIENT] 🚀 Submit triggered. Input:', input);
    sendMessage({ text: input }, { body: { sessionId: activeSessionId, fastMode } });
    console.log('[CLIENT] 📡 Append called. Waiting for network...');
    setInput('');
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await fetch(`/api/chat/session?sessionId=${sessionToDelete}`, { method: 'DELETE' });
      deleteSession(sessionToDelete);
    } catch (error) {
      console.error('Failed to delete session', error);
    }
    setSessionToDelete(null);
  };

  const handleTitleClick = (e: React.MouseEvent, session: any) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleTitleSubmit = async (e: React.FormEvent | React.FocusEvent | React.KeyboardEvent, id: string) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (editingSessionId !== id) return;
    
    setEditingSessionId(null);
    if (!editTitle.trim()) return;

    try {
      await fetch(`/api/chat/session`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, title: editTitle.trim() })
      });
      updateSessionTitle(id, editTitle.trim());
    } catch (error) {
      console.error('Failed to rename session', error);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0 h-full">
      {/* LEFT COLUMN: CHAT CONSOLE */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col min-h-0 relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] group"
        style={{ backgroundImage: "url('/ChatbotBG.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Dark translucent overlay */}
        <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none" />

        {/* Chat Header */}
        <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold font-clash tracking-wide text-white">BioArc AI Core</h2>
              <p className="text-xs text-zinc-400 font-satoshi">{activeSession?.title || "No active session"}</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scroll-smooth no-scrollbar relative z-10">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <Bot className="w-16 h-16 opacity-20" />
              <p className="font-satoshi text-lg">Select or start a new session to begin.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {/* Map over LIVE AI SDK messages instead of mocked store messages */}
              {messages.map((msg: UIMessage, idx) => {
                const isUser = msg.role === 'user';
                console.log('[DEBUG_RENDER] msg:', JSON.stringify(msg));
                // Parse the v4 message payload text or fallback to string content
                const textContent = (msg as any).content || (msg.parts?.map((part: any) =>
                  part.type === 'text' ? part.text : ''
                ).join('')) || '';

                // 🔥 VERCEL SDK v6 FIX: Extract tool invocations directly from the parts array
                const tools = msg.parts
                  ? msg.parts
                    .filter((part: any) => part.type === 'tool-invocation')
                    .map((part: any) => part.toolInvocation)
                  : (msg as any).toolInvocations || [];

                if (!textContent.trim() && tools.length === 0) return null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {isUser ? (
                        <>
                          <span className="text-sm font-medium text-emerald-400 font-satoshi">You</span>
                          <User className="w-4 h-4 text-emerald-400" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-400 font-satoshi">BioArc AI</span>
                        </>
                      )}
                    </div>

                    {!isUser && tools.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2 w-full">
                        {tools.map((tool: any) => (
                          <div key={tool.toolCallId} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-2 text-xs font-mono text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)] w-fit">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            System Action: {tool.toolName}
                          </div>
                        ))}
                      </div>
                    )}
                    {textContent.trim() && (
                      <div className={`px-5 py-3 rounded-2xl whitespace-pre-wrap font-satoshi text-[15px] leading-relaxed backdrop-blur-md ${isUser
                        ? 'bg-emerald-500/10 text-emerald-50 rounded-tr-sm shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                        : 'bg-white/[0.03] text-zinc-100 rounded-tl-sm shadow-lg'
                        }`}>
                        {textContent}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-5 bg-gradient-to-t from-black via-black/80 to-transparent relative z-10">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            {/* Mode Toggle Inside Input */}
            <button
              type="button"
              onClick={toggleFastMode}
              disabled={!activeSession}
              title={fastMode ? "Fast Mode: Uses Gemini 3.5 Flash for rapid responses" : "Deep Mode: Uses Gemma 4 31B IT for complex reasoning"}
              className={`absolute left-2 flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fastMode ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                }`}
            >
              {fastMode ? <Zap className="w-3.5 h-3.5" /> : <BrainCircuit className="w-3.5 h-3.5" />}
              {fastMode ? 'FAST' : 'DEEP'}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeSession ? "Command the bioreactor..." : "Start a session to begin..."}
              disabled={!activeSession || isLoading}
              className="w-full bg-white/[0.02] rounded-full pl-[100px] py-4 pr-[100px] text-white placeholder-zinc-500 font-satoshi focus:outline-none focus:bg-white/[0.04] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner focus:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            />
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              disabled={!activeSession || isLoading}
              className="absolute right-14 p-2.5 text-zinc-400 hover:text-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Voice Chat"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || !activeSession || isLoading}
              className="absolute right-2 p-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-105"
              title="Send Message"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </motion.div>

      {/* RIGHT COLUMN: HISTORY SIDEBAR (Untouched) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 flex flex-col gap-6 min-h-0 shrink-0"
      >
        {/* History List Card */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="px-2 py-4 flex items-center justify-between z-10">
            <h3 className="font-satoshi font-semibold text-sm tracking-widest text-zinc-400 uppercase">Chat Sessions</h3>
            <button
              onClick={createNewSession}
              className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all cursor-pointer"
              title="New Session"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-2 custom-scrollbar">
            {chatHistory.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-1.5 group relative ${activeSessionId === session.id
                  ? 'bg-white/[0.04] shadow-sm'
                  : 'hover:bg-white/[0.02]'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  {editingSessionId === session.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={(e) => handleTitleSubmit(e, session.id)}
                      onKeyDown={(e) => handleTitleSubmit(e, session.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={`font-satoshi font-medium text-[15px] pr-6 bg-transparent outline-none border-b border-emerald-500/50 w-full ${activeSessionId === session.id ? 'text-emerald-400' : 'text-white'}`}
                    />
                  ) : (
                    <h4 
                      onClick={(e) => handleTitleClick(e, session)}
                      className={`font-satoshi font-medium truncate text-[15px] pr-6 ${activeSessionId === session.id ? 'text-emerald-400' : 'text-zinc-300 group-hover:text-white cursor-text'}`}
                    >
                      {session.title}
                    </h4>
                  )}
                  {activeSessionId === session.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-satoshi truncate leading-relaxed pr-6">
                  {session.messages[session.messages.length - 1]?.content || "Empty session"}
                </p>
                <p className="text-[10px] text-zinc-600 font-mono">
                  {session.date}
                </p>
                <div
                  onClick={(e) => handleDeleteClick(session.id, e)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 cursor-pointer transition-all"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live FSM State Widget */}
        <div className="p-6 border border-white/[0.05] rounded-3xl shadow-xl flex flex-col gap-4 shrink-0 relative overflow-hidden bg-white/[0.01] backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Activity className="w-20 h-20 text-white" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <h4 className="font-satoshi font-semibold text-zinc-400 text-xs tracking-widest uppercase">System Status</h4>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-medium">LIVE</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="font-clash text-xl text-white font-medium tracking-wide">
              {fsm.mode} <span className="text-zinc-500 text-sm font-satoshi">Mode</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1 relative z-10">
            <div className="bg-black/20 p-3 rounded-2xl border border-white/[0.02]">
              <div className="text-[10px] text-zinc-500 font-satoshi tracking-wide mb-1 uppercase">Water Temp</div>
              <div className="text-base font-medium text-zinc-200 font-satoshi">{telemetry.waterTemp}<span className="text-xs text-zinc-500 ml-0.5">°C</span></div>
            </div>
            <div className="bg-black/20 p-3 rounded-2xl border border-white/[0.02]">
              <div className="text-[10px] text-zinc-500 font-satoshi tracking-wide mb-1 uppercase">Growth Rate</div>
              <div className="text-base font-medium text-emerald-400 font-satoshi">{telemetry.algaeGrowthRate}<span className="text-xs text-emerald-400/50 ml-0.5">μ</span></div>
            </div>
          </div>
        </div>
      </motion.div>
      <VoiceChatModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {sessionToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-zinc-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full text-red-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-satoshi font-semibold text-white">Delete Session?</h3>
              </div>
              <p className="text-zinc-400 text-sm font-satoshi mb-6">
                Are you sure you want to permanently delete this chat session? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="px-5 py-2.5 rounded-full font-satoshi text-sm font-medium text-zinc-300 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSession}
                  className="px-5 py-2.5 rounded-full font-satoshi text-sm font-medium bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}