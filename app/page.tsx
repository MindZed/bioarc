// app/page.tsx
// Dashboard page for the bioreactor

"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { motion, stagger, useAnimate } from "framer-motion";
import { Bot, Leaf, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from "recharts";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { telemetry, fsm, updateTelemetry } = useStore();
  const { data: session } = useSession();
  const [scope, animate] = useAnimate();
  const [mounted, setMounted] = useState(false);

  const biomassChartData = [
    { day: "Sun", value: 30 },
    { day: "Mon", value: 45 },
    { day: "Tue", value: 70 },
    { day: "Wed", value: 85 },
    { day: "Thu", value: 82 },
    { day: "Fri", value: 92 },
    { day: "Sat", value: 95 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      updateTelemetry();
    }, 2000);
    return () => clearInterval(interval);
  }, [updateTelemetry]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      animate(".motion-card", { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.1), duration: 0.5, ease: "easeOut" });
    }
  }, [animate, mounted]);

  if (!mounted) return null;

  return (
    <div ref={scope}>
      {/* Top Status Bar */}
      <div className="bg-surface-container-lowest/50 backdrop-blur-sm border-b border-outline-variant px-6 max-md:px-4 py-2 flex max-md:overflow-x-auto no-scrollbar justify-between items-center text-[10px] font-medium tracking-wider uppercase text-on-surface-variant gap-6">
        <div className="flex gap-4 shrink-0">
          <div className="flex items-center">
            <span className="animate-pulse bg-secondary-fixed-dim rounded-full w-1.5 h-1.5 inline-block mr-1.5"></span>
            MQTT: Connected (12ms)
          </div>
          <div>ML Model Status: Active (94% Confidence)</div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div>ESP32 Link: Strong (-60dBm)</div>
          <div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">System Mode: {fsm.mode}</div>
        </div>
      </div>

      {/* Header */}
      <header className="flex max-md:flex-col justify-between items-start w-full pt-8 max-md:pt-4 pb-4 px-8 max-md:px-4 z-40 mb-2 transition-all duration-300 ease-in-out bg-surface-container-low/90 gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-primary tracking-tight leading-tight">Dashboard</h1>
          <p className="text-[14px] md:text-[16px] text-on-surface-variant mt-1 mb-2">Real-time telemetry and automation control center.</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-[11px] font-medium text-on-surface-variant">
             <span className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md border border-outline-variant/30"><span className="material-symbols-outlined text-[14px]">air</span> Ambient: <span className="text-on-surface font-semibold ml-0.5">{telemetry.ambientTemp}°C</span></span>
             <span className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md border border-outline-variant/30"><span className="material-symbols-outlined text-[14px]">water_drop</span> Humidity: <span className="text-on-surface font-semibold ml-0.5">{telemetry.humidity}%</span></span>
             <span className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md border border-outline-variant/30"><span className="material-symbols-outlined text-[14px]">compress</span> Pressure: <span className="text-on-surface font-semibold ml-0.5">{telemetry.pressure} hPa</span></span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg text-[14px] font-bold hover:bg-primary hover:text-on-primary transition-all duration-200 hover:scale-95">
            <span className="material-symbols-outlined text-sm">settings_suggest</span>
            Manual Override Mode
          </button>
          <div className="flex items-center gap-1.5 ml-4 border-l border-outline-variant pl-4">
            <button className="p-1.5 text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-1.5 text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bento Grid Dashboard */}
      <div className="px-8 pb-12 flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="bento-grid">
          
          {/* 1. Algae Growth Rate */}
          <div className="max-md:order-1 col-span-1 md:col-span-1 lg:col-span-1 bg-primary text-black rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-primary opacity-0 hover:shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
            <div className="absolute inset-0 z-0 opacity-40">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="algaeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-on-primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-on-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 100 L0 90 Q 25 85, 50 70 T 100 20 L 100 100 Z" fill="url(#algaeGradient)"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <h3 className="font-satoshi text-[13px] font-semibold text-on-primary/70 uppercase tracking-wider">Algae Growth Rate (μ)</h3>
              <div className="mt-3">
                <div className="text-[36px] font-semibold text-on-primary mb-1 leading-none">
                  {telemetry.algaeGrowthRate.toFixed(3)}<span className="text-lg text-on-primary/70 ml-1">h⁻¹</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-primary/80">
                  <span className="flex items-center justify-center w-4 h-4 rounded bg-on-primary/20 text-on-primary text-xs">
                    <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                  </span>
                  Increased from yesterday
                </div>
              </div>
            </div>
          </div>

          {/* 2. Water Temperature */}
          <div className="max-md:order-2 col-span-1 md:col-span-1 lg:col-span-1 bg-surface-container-lowest text-on-surface rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0 hover:border-outline/50 transition-colors duration-300">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 60 Q 10 55, 20 60 T 40 65 T 60 60 T 80 55 T 100 60 L 100 100 L 0 100 Z" fill="#60a5fa"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">Water Temp</h3>
              <div className="mt-3">
                <div className="text-[36px] font-semibold text-on-surface leading-none">
                  {telemetry.waterTemp}<span className="text-lg text-on-surface-variant ml-1 font-normal">°C</span>
                </div>
                <div className="text-xs text-on-surface-variant mt-1">Target: 20-30°C</div>
              </div>
            </div>
          </div>

          {/* 3. Virtual Sensor: pH */}
          <div className="max-md:order-3 col-span-1 md:col-span-1 lg:col-span-1 bg-surface-container-lowest text-on-surface rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0 hover:border-outline/50 transition-colors duration-300">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 80 Q 25 75, 50 78 T 100 75 L 100 100 L 0 100 Z" fill="#818cf8"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">Virtual pH</h3>
                <div className="px-1.5 py-0.5 flex items-center rounded bg-secondary-fixed/10 text-secondary-fixed font-semibold text-[9px] border border-secondary/20 shrink-0">
                  <Bot className="w-2.5 h-2.5 mr-0.5" /> ML
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[36px] font-semibold text-on-surface leading-none">
                  {telemetry.predictedPh.toFixed(2)}
                </div>
                <div className="text-xs text-on-surface-variant mt-1">Stable range</div>
              </div>
            </div>
          </div>

          {/* 4. Virtual Sensor: O2 (DO) */}
          <div className="max-md:order-4 col-span-1 md:col-span-1 lg:col-span-1 bg-surface-container-lowest text-on-surface rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0 hover:border-outline/50 transition-colors duration-300">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 70 Q 20 80, 40 70 T 60 75 T 80 65 T 100 70 L 100 100 L 0 100 Z" fill="#2dd4bf"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">Virtual O² (DO)</h3>
                <div className="px-1.5 py-0.5 flex items-center rounded bg-secondary-fixed/10 text-secondary-fixed font-semibold text-[9px] border border-secondary/20 shrink-0">
                  <Bot className="w-2.5 h-2.5 mr-0.5" /> ML
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[36px] font-semibold text-on-surface mb-1 leading-none">
                  {telemetry.predictedDo.toFixed(2)}<span className="text-base text-on-surface-variant ml-1 font-normal">mg/L</span>
                </div>
                <div className="text-xs text-on-surface-variant">Optimal range</div>
              </div>
            </div>
          </div>

          {/* 7. Actuator Array */}
          <div className="max-md:order-7 col-span-2 md:col-span-3 lg:col-span-2 lg:row-span-2 bg-surface-container-lowest border border-outline-variant flex flex-col motion-card min-h-0 font-clash shadow-md p-4 rounded-2xl opacity-0 hover:border-outline/50 transition-colors duration-300 relative overflow-hidden">
            
            {session?.user?.role !== 'ADMIN' && (
              <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                <ShieldAlert className="w-8 h-8 text-red-400 mb-2" />
                <h4 className="text-sm font-semibold text-white">Admin Access Required</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Hardware actuators are locked.</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-3">
              <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">Actuator Array</h3>
              <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
                {Object.values(fsm).filter(v => v === true).length} Active
              </div>
            </div>
            <ul className={`flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1 ${session?.user?.role !== 'ADMIN' ? 'opacity-20 pointer-events-none' : ''}`}>
              <ActuatorItem name="Inlet Pump" icon="water_pump" active={fsm.inletPump} />
              <ActuatorItem name="Outlet Pump" icon="valve" active={fsm.outletPump} />
              <ActuatorItem name="Air Compressor" icon="air" active={fsm.airCompressor} />
              <ActuatorItem name="LED Panel A" icon="light_mode" active={fsm.ledPanels} />
              <ActuatorItem name="LED Panel B" icon="lightbulb" active={false} />
            </ul>
          </div>

          {/* 5. Biomass Trends (Chart) */}
          <div className="max-md:order-5 col-span-2 md:col-span-3 lg:col-span-2 lg:row-span-2 bg-surface-container-lowest border border-outline-variant flex flex-col motion-card min-h-0 font-clash min-h-[260px] shadow-md p-4 rounded-2xl opacity-0 hover:border-outline/50 transition-colors duration-300">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">Biomass Trends</h3>
              <div className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Chlorophyll-A</div>
            </div>
            <div className="flex-1 flex flex-col relative min-h-0">
              <div className="relative flex-1 w-full min-h-[200px] -ml-4 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={biomassChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="biomassColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container-highest)', borderColor: 'var(--color-outline-variant)', borderRadius: '8px', color: 'var(--color-on-surface)', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#biomassColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 9. Reservoir Level (Gauge) */}
          <div className="max-md:order-8 col-span-2 md:col-span-3 lg:col-span-2 bg-surface-container-lowest border border-outline-variant flex flex-col items-center justify-center motion-card min-h-0 font-clash relative shadow-md p-4 rounded-2xl opacity-0 hover:border-outline/50 transition-colors duration-300">
            <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant absolute top-4 left-4 uppercase tracking-wider">Reservoir Level</h3>
            <div className="relative w-28 h-40 mt-6 border-4 border-surface-container-highest rounded-2xl overflow-hidden bg-surface-container shadow-inner">
              <div className="absolute bottom-0 left-0 w-full bg-secondary-fixed-dim transition-all duration-1000 ease-in-out" style={{ height: `${telemetry.reservoirVolume}%` }}>
                <div className="absolute -top-2 left-0 w-[200%] h-6 bg-secondary-fixed-dim opacity-50 animate-pulse" style={{ borderRadius: '38% 42% 0 0', transform: 'translateX(-25%)' }}></div>
                <div className="absolute -top-3 left-0 w-[200%] h-6 bg-secondary-fixed-dim" style={{ borderRadius: '43% 37% 0 0', transform: 'translateX(-10%)' }}></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className="text-3xl font-bold text-on-surface drop-shadow-sm">{telemetry.reservoirVolume.toFixed(0)}%</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Volume</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between w-full text-[10px] font-semibold px-2">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span> Optimal</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-surface-container-high"></span> Empty</div>
            </div>
          </div>

          {/* 6. Automation System Status */}
          <div className="max-md:order-6 col-span-2 md:col-span-3 lg:col-span-2 bg-surface-container-lowest text-on-surface rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0 hover:border-outline/50 transition-colors duration-300">
            <div className="flex h-full w-full">
              <div className="w-[60%] flex flex-col justify-between relative z-10">
                <div>
                  <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Carbon Capture</h3>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed/10 text-secondary-fixed font-bold text-[9px] border border-secondary/20 whitespace-nowrap">
                    <Leaf className="w-2.5 h-2.5 mr-1" /> Net Positive
                  </div>
                </div>
                <div className="space-y-3 mt-3">
                  <div>
                    <div className="text-[32px] font-bold text-primary leading-none">
                      {(telemetry.algaeGrowthRate * 12.4).toFixed(1)}<span className="text-base ml-1 text-on-surface-variant font-normal">g</span>
                    </div>
                    <div className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mt-1">CO₂ Absorbed</div>
                  </div>
                  <div className="pt-3 border-t border-outline-variant/30">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-on-surface">{(telemetry.algaeGrowthRate * 15.2).toFixed(1)}</span>
                      <span className="text-xs text-on-surface-variant">g</span>
                    </div>
                    <div className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">O₂ Produced</div>
                  </div>
                </div>
              </div>
              <div className="w-[40%] relative -mr-4 -my-4 overflow-hidden rounded-r-2xl">
                <img alt="Bioreactor Illustration" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn4JNdEDB3qnQNJhoZ3Tp5qpwSLe0skw5wWlDkuzW0hdDYpfnzv1QgiCORyJzgp2opkGdxaWKt5RfKpxcZ5DQ4T7BAAHYw589Ujewx3F3TrihgeqEUovffvL_A4Jj-x_VRxPeDX3y9W3vJOM8AirpcxYq3gEnyYxpJKWWvQHQ-v4l_Hv3_Y6_GXZZyIzOcoDCZ75gZQJuoW_RlXgUJhbOPgSySOG2p1AG_0XTXTknW-NRJwZYX8LVc_eDx9703Isor19N-NtGirs8v" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface-container-lowest"></div>
              </div>
            </div>
          </div>

          {/* 8. Recent System Events & Logs */}
          <div className="max-md:order-9 col-span-2 md:col-span-3 lg:col-span-2 bg-surface-container-lowest border border-outline-variant flex flex-col motion-card min-h-0 font-clash shadow-md p-4 rounded-2xl opacity-0 hover:border-outline/50 transition-colors duration-300">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">System Logs</h3>
              <button className="border border-outline-variant px-2 py-0.5 rounded-full text-[10px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">View All</button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1">
              <LogItem message="State shifted to AGITATING" time="05:14 PM" type="System" active={fsm.agitator} color="bg-primary" />
              <LogItem message="Water level refreshed" time="04:30 PM" type="Success" active={true} color="bg-secondary-fixed-dim" />
              <LogItem message="pH recalibrated via ML" time="03:15 PM" type="Info" active={true} color="bg-surface-variant" />
            </div>
          </div>

          {/* 10. FSM State Runtime (Compact Timer) */}
          <div className="max-md:order-10 col-span-2 md:col-span-3 lg:col-span-6 bg-surface-container-lowest rounded-2xl px-6 py-3 shadow-md text-on-surface flex motion-card min-h-0 font-clash relative overflow-hidden border border-primary/20 items-center justify-between opacity-0 hover:border-primary/40 transition-colors duration-300">
            <div className="absolute inset-0 bg-primary/5"></div>
            <div className="relative z-10 flex items-center gap-3">
              <h3 className="font-satoshi text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider">FSM Runtime</h3>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Phase</span>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-[28px] font-bold tracking-tight text-on-surface font-mono">01:24:08</div>
              <div className="flex gap-1.5">
                <button className="w-8 h-8 rounded-full bg-surface-container text-primary flex items-center justify-center hover:bg-surface-variant transition-all shadow-sm hover:scale-105 active:scale-95 border border-primary/20">
                  <span className="material-symbols-outlined fill text-[16px]">pause</span>
                </button>
                <button className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all shadow-sm hover:scale-105 active:scale-95 border border-error/20">
                  <span className="material-symbols-outlined fill text-[16px]">stop</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ActuatorItem({ name, icon, active }: { name: string, icon: string, active: boolean }) {
  return (
    <li className="flex items-center justify-between p-2 hover:bg-surface-container rounded-xl transition-all duration-200 cursor-pointer group">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          active ? 'bg-secondary-fixed/20 text-secondary-fixed' : 'bg-surface-container text-on-surface-variant group-hover:text-primary'
        }`}>
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </div>
        <span className="text-[13px] text-on-surface font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-secondary-fixed-dim' : 'bg-surface-container-high'}`}></span>
        <span className={`text-[10px] font-semibold ${active ? 'text-secondary-fixed' : 'text-on-surface-variant'}`}>
          {active ? 'Active' : 'Idle'}
        </span>
      </div>
    </li>
  );
}

function LogItem({ message, time, type, active, color }: { message: string, time: string, type: string, active: boolean, color: string }) {
  if (!active) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-lg hover:bg-surface-container transition-all duration-200 p-2">
      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${color} shrink-0`}></div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <span className="font-medium text-[13px] text-on-surface truncate">{message}</span>
          <span className="text-[10px] text-on-surface-variant shrink-0">{time}</span>
        </div>
        <span className={`inline-block mt-0.5 px-1.5 py-0 rounded text-[9px] font-medium ${
          type === 'System' ? 'bg-primary/10 text-primary' : 
          type === 'Success' ? 'bg-secondary-fixed/20 text-secondary-fixed' : 
          'bg-surface-container-high text-on-surface-variant'
        }`}>{type}</span>
      </div>
    </div>
  );
}
