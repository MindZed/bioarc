// app/metrics/page.tsx
// Metrics page for the bioreactor

"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Calendar, Activity, Thermometer, Droplets, Wind, Focus } from 'lucide-react';

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-xl border border-white/[0.05] p-4 rounded-2xl shadow-2xl">
        <p className="text-zinc-400 text-xs font-mono mb-3 uppercase tracking-wider">{label}</p>
        <div className="space-y-2 font-satoshi">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-4 justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: entry.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }} />
                {entry.name}
              </span>
              <span className="font-bold text-white tracking-wide">
                {entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MetricsPage() {
  const { metricsData, selectedTimeRange, setSelectedTimeRange } = useStore();
  const [mounted, setMounted] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState({
    opticalDensity: true,
    waterTemp: true,
    ph: true,
    dissolvedOxygen: true,
    flowRate: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute summary stats based on current data
  const summary = useMemo(() => {
    if (!metricsData.length) return null;
    const count = metricsData.length;
    
    // Growth Rate estimation: Diff between last and first OD
    const firstOD = metricsData[0].opticalDensity;
    const lastOD = metricsData[count - 1].opticalDensity;
    const growthDiff = (lastOD - firstOD) / firstOD;

    const avgTemp = metricsData.reduce((acc, curr) => acc + curr.waterTemp, 0) / count;
    const avgPh = metricsData.reduce((acc, curr) => acc + curr.ph, 0) / count;
    const avgDO = metricsData.reduce((acc, curr) => acc + curr.dissolvedOxygen, 0) / count;

    return {
      growthRate: (growthDiff * 100).toFixed(1),
      avgTemp: avgTemp.toFixed(1),
      avgPh: avgPh.toFixed(2),
      avgDO: avgDO.toFixed(1),
    };
  }, [metricsData]);

  if (!mounted || !summary) return null;

  const toggleMetric = (metricKey: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({ ...prev, [metricKey]: !prev[metricKey] }));
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 bg-black/40 backdrop-blur-xl border border-white/[0.05] p-4 rounded-3xl shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-clash text-lg font-bold text-white tracking-wide">Telemetry Explorer</h2>
            <p className="text-xs text-zinc-400 font-satoshi">Historical Sensor Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-black/40 border border-white/[0.05] rounded-full p-1 backdrop-blur-md">
            {['7D', '30D', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                  selectedTimeRange === range
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-full text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-all hover:border-white/10 group">
            <Download className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
            Export
          </button>
        </div>
      </motion.div>

      {/* MAIN CHART AREA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-[400px] flex flex-col bg-black/20 backdrop-blur-xl border border-white/[0.02] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden"
      >
        {/* Metric Toggles */}
        <div className="flex flex-wrap gap-3 mb-6 shrink-0 relative z-10">
          <MetricToggle 
            label="Biomass (OD)" 
            icon={<Focus className="w-3.5 h-3.5" />}
            color="#10b981" 
            active={activeMetrics.opticalDensity} 
            onClick={() => toggleMetric('opticalDensity')} 
          />
          <MetricToggle 
            label="Temp" 
            icon={<Thermometer className="w-3.5 h-3.5" />}
            color="#f59e0b" 
            active={activeMetrics.waterTemp} 
            onClick={() => toggleMetric('waterTemp')} 
          />
          <MetricToggle 
            label="pH Level" 
            icon={<Droplets className="w-3.5 h-3.5" />}
            color="#a855f7" 
            active={activeMetrics.ph} 
            onClick={() => toggleMetric('ph')} 
          />
          <MetricToggle 
            label="D.O." 
            icon={<Wind className="w-3.5 h-3.5" />}
            color="#3b82f6" 
            active={activeMetrics.dissolvedOxygen} 
            onClick={() => toggleMetric('dissolvedOxygen')} 
          />
          <MetricToggle 
            label="Flow Rate" 
            icon={<Activity className="w-3.5 h-3.5" />}
            color="#06b6d4" 
            active={activeMetrics.flowRate} 
            onClick={() => toggleMetric('flowRate')} 
          />
        </div>

        {/* The Recharts Graph */}
        <div className="flex-1 w-full min-h-0 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="rgba(255,255,255,0.2)" 
                tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              {activeMetrics.opticalDensity && (
                <Area type="monotone" dataKey="opticalDensity" name="Biomass (OD)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOD)" />
              )}
              {activeMetrics.waterTemp && (
                <Line type="monotone" dataKey="waterTemp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#f59e0b', stroke: '#000', strokeWidth: 2 }} />
              )}
              {activeMetrics.ph && (
                <Line type="monotone" dataKey="ph" name="pH Level" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#a855f7', stroke: '#000', strokeWidth: 2 }} />
              )}
              {activeMetrics.dissolvedOxygen && (
                <Line type="monotone" dataKey="dissolvedOxygen" name="D.O. (mg/L)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6', stroke: '#000', strokeWidth: 2 }} />
              )}
              {activeMetrics.flowRate && (
                <Line type="monotone" dataKey="flowRate" name="Flow Rate (L/m)" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#06b6d4', stroke: '#000', strokeWidth: 2 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* BOTTOM SECTION: KEY INDICATORS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0"
      >
        <SummaryCard label="Net Biomass Growth" value={`+${summary.growthRate}%`} color="emerald" />
        <SummaryCard label="Average Temp" value={`${summary.avgTemp}°C`} color="amber" />
        <SummaryCard label="Mean pH Level" value={summary.avgPh} color="purple" />
        <SummaryCard label="Average D.O." value={`${summary.avgDO} mg/L`} color="blue" />
      </motion.div>

    </div>
  );
}

// Sub-components
function MetricToggle({ label, icon, color, active, onClick }: { label: string, icon: React.ReactNode, color: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
        active 
          ? 'bg-white/[0.03] text-white shadow-lg' 
          : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'
      }`}
      style={{ borderColor: active ? `${color}40` : 'transparent' }}
    >
      <div 
        className={`flex items-center justify-center transition-all ${active ? '' : 'opacity-40 grayscale'}`}
        style={{ color: active ? color : undefined }}
      >
        {icon}
      </div>
      {label}
      {active && (
        <div className="w-1.5 h-1.5 rounded-full ml-1 animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      )}
    </button>
  );
}

function SummaryCard({ label, value, color }: { label: string, value: string, color: 'emerald' | 'amber' | 'purple' | 'blue' }) {
  const colorMap = {
    emerald: 'text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20',
    amber: 'text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/20',
    purple: 'text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/20',
    blue: 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] border-blue-500/20',
  };

  return (
    <div className={`flex flex-col gap-1 p-5 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/[0.02] relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -z-10 opacity-20 transition-transform duration-700 group-hover:scale-150 ${colorMap[color].split(' ')[0].replace('text', 'bg')}`} />
      
      <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">{label}</span>
      <span className={`font-clash text-2xl font-bold tracking-wide ${colorMap[color].split(' ')[0]}`}>{value}</span>
    </div>
  );
}
