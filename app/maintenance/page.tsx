// app/maintenance/page.tsx
// Maintenance page for the bioreactor

"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Activity, Wrench, AlertTriangle, ShieldCheck, Terminal, Disc3, Database, Lock, Unlock, X, Save } from 'lucide-react';

export default function MaintenancePage() {
  const { maintenanceLogs, hardwareLifespan } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveContext = async () => {
    setStatusMessage('');
    if (!password || !keyword || !content) {
      setStatusMessage('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, keyword, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Success! Context added.');
        setKeyword('');
        setContent('');
        setTimeout(() => setIsContextModalOpen(false), 2000);
      } else {
        setStatusMessage(data.error || 'Failed to save');
      }
    } catch (e) {
      setStatusMessage('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getHealthColor = (percentage: number) => {
    if (percentage > 74) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (percentage > 39) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
  };

  const getHealthTextColor = (percentage: number) => {
    if (percentage > 74) return 'text-emerald-400';
    if (percentage > 39) return 'text-amber-400';
    return 'text-red-400';
  };

  const agitator = hardwareLifespan.find(hw => hw.name === 'Agitator Motor');
  const agitatorHealth = agitator ? agitator.healthPercentage : 100;
  
  // Radial SVG calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (agitatorHealth / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center z-10 shrink-0">
        <h2 className="font-clash text-2xl font-bold text-white tracking-wide">Maintenance</h2>
        <button 
          onClick={() => setIsContextModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-white/[0.05] hover:border-emerald-500/50 rounded-xl transition-all text-sm font-satoshi text-zinc-300 hover:text-white group"
        >
          <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          Update Knowledge Base
        </button>
      </div>

      {/* TOP SECTION: Diagnostics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        
        {/* RELAY & PUMP LIFESPANS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110">
            <Wrench className="w-32 h-32 text-white" />
          </div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-clash text-lg font-semibold text-white tracking-wide">Relay & Pump Lifespans</h3>
          </div>

          <div className="space-y-5 relative z-10">
            {hardwareLifespan.filter(hw => hw.name !== 'Agitator Motor').map((hw, idx) => (
              <motion.div 
                key={hw.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between font-satoshi text-sm">
                  <span className="text-zinc-300 font-medium tracking-wide">{hw.name}</span>
                  <span className={`font-bold font-mono ${getHealthTextColor(hw.healthPercentage)}`}>{hw.healthPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${hw.healthPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${getHealthColor(hw.healthPercentage)}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AGITATOR DIAGNOSTICS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-8 group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform duration-700 group-hover:rotate-12">
            <Disc3 className="w-32 h-32 text-white" />
          </div>

          <div className="flex-1 flex flex-col h-full z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Disc3 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-clash text-lg font-semibold text-white tracking-wide">Agitator Diagnostics</h3>
            </div>
            <p className="text-zinc-400 font-satoshi text-sm leading-relaxed mb-auto">
              Magnetic sweep and motor impedance sensors suggest nominal wear on the primary bioreactor agitation unit. Next scheduled maintenance is in 1,200 hours.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider w-max">
              <ShieldCheck className="w-3.5 h-3.5" />
              Optimal Status
            </div>
          </div>

          {/* Radial Progress */}
          <div className="relative shrink-0 w-36 h-36 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-white/[0.05] fill-transparent"
                strokeWidth="10"
              />
              {/* Foreground circle */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-emerald-500 fill-transparent shadow-emerald-glow"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-clash font-bold text-3xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                {agitatorHealth}<span className="text-lg opacity-80">%</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-emerald-500/70 tracking-widest mt-1">Health</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM SECTION: TERMINAL LOGS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 min-h-[300px] flex flex-col bg-zinc-950/90 backdrop-blur-3xl border border-white/[0.05] rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Terminal Header */}
        <div className="px-6 py-3 border-b border-white/[0.05] bg-black/60 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <h3 className="font-mono text-xs font-semibold text-zinc-400 tracking-widest uppercase">System Event Log</h3>
          </div>
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
          </div>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-3 custom-scrollbar">
          <AnimatePresence initial={false}>
            {maintenanceLogs.map((log) => {
              const isWarning = log.severity === 'warning';
              const isCritical = log.severity === 'critical';
              
              let textColor = 'text-zinc-400';
              let badgeBg = 'bg-zinc-800/50 text-zinc-500 border border-white/5';
              let icon = null;

              if (isCritical) {
                textColor = 'text-red-300';
                badgeBg = 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 inline-block" />;
              } else if (isWarning) {
                textColor = 'text-amber-300';
                badgeBg = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 inline-block" />;
              }

              return (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.02]"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-zinc-600 w-24">[{log.timestamp}]</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${badgeBg} w-24 text-center font-bold`}>
                      {log.severity}
                    </span>
                  </div>
                  <div className={`flex-1 leading-relaxed ${textColor}`}>
                    {icon}
                    {log.message}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* KNOWLEDGE BASE MODAL */}
      <AnimatePresence>
        {isContextModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsContextModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 flex flex-col gap-6">
                {!isUnlocked ? (
                  <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-2">
                      <Lock className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-clash text-xl font-semibold text-white">Admin Authorization Required</h3>
                      <p className="text-zinc-400 font-satoshi text-sm mt-2">Enter the admin password to modify the secure knowledge base.</p>
                    </div>
                    <div className="w-full mt-4 flex flex-col gap-3">
                      <input
                        type="password"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                      <button
                        onClick={() => {
                          if (password.trim()) setIsUnlocked(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl px-4 py-3 transition-colors"
                      >
                        <Unlock className="w-4 h-4" />
                        Unlock System
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Database className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-clash text-lg font-semibold text-white">Add System Context</h3>
                        <p className="text-zinc-400 text-xs font-satoshi">Securely inject facts into the RAG pipeline.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. goals, architecture, pump..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Context Data</label>
                      <textarea
                        placeholder="Detailed facts and system logic..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSaveContext}
                      disabled={isSubmitting}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-black font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? 'Saving...' : 'Save to Database'}
                    </button>

                    {statusMessage && (
                      <div className={`text-center text-sm font-semibold p-2 rounded-lg ${statusMessage.includes('Success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {statusMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
