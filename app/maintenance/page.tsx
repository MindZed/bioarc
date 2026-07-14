// app/maintenance/page.tsx
// Maintenance page for the bioreactor

"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Activity, Wrench, AlertTriangle, ShieldCheck, Terminal, Disc3 } from 'lucide-react';

export default function MaintenancePage() {
  const { maintenanceLogs, hardwareLifespan } = useStore();
  const [mounted, setMounted] = useState(false);

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
    </div>
  );
}
