// app/page.tsx
// Dashboard page for the bioreactor

"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { motion, stagger, useAnimate } from "framer-motion";
import { Bot, Leaf } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from "recharts";

export default function Dashboard() {
  const { telemetry, fsm, updateTelemetry } = useStore();
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
      <div className="bg-surface-container-lowest/50 backdrop-blur-sm border-b border-outline-variant px-6 py-2 flex justify-between items-center text-[10px] font-medium tracking-wider uppercase text-on-surface-variant">
        <div className="flex gap-2">
          <div className="flex items-center">
            <span className="animate-pulse bg-secondary-fixed-dim rounded-full w-1.5 h-1.5 inline-block mr-1.5"></span>
            MQTT: Connected (12ms)
          </div>
          <div>ML Model Status: Active (94% Confidence)</div>
        </div>
        <div className="flex items-center gap-2">
          <div>ESP32 Link: Strong (-60dBm)</div>
          <div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">System Mode: {fsm.mode}</div>
        </div>
      </div>

      {/* Header */}
      <header className="flex justify-between items-start w-full pt-8 pb-4 px-8 sticky top-0 backdrop-blur-md z-40 mb-2 transition-all duration-300 ease-in-out bg-surface-container-low/90">
        <div>
          <h1 className="text-[24px] font-bold text-primary tracking-tight leading-tight">Dashboard</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">Real-time telemetry and automation control center.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg text-[14px] font-bold hover:bg-primary hover:text-on-primary transition-all duration-200 hover:scale-95">
            <span className="material-symbols-outlined text-sm">settings_suggest</span>
            Manual Override Mode
          </button>
          <button className="flex items-center gap-1.5 border border-outline-variant text-on-surface px-5 py-2.5 rounded-lg text-[14px] font-bold hover:bg-surface-container transition-all duration-200 hover:scale-95 bg-surface-container-lowest">
            Quick Export
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
        <div className="grid grid-cols-12 gap-6" id="bento-grid">
          
          {/* 1. Algae Growth Rate */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-primary text-on-primary rounded-3xl p-3 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-primary opacity-0">
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
              <div className="flex justify-between items-center">
                <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Algae Growth Rate (μ)</h3>
                <button className="w-8 h-8 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-on-primary/10 transition-colors text-on-primary">
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </button>
              </div>
              <div className="mt-2">
                <div className="text-[48px] font-bold text-on-primary mb-2 leading-none">
                  {telemetry.algaeGrowthRate.toFixed(3)}<span className="text-2xl text-on-primary/80 ml-1">h⁻¹</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-on-primary">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-on-primary/20 text-on-primary text-xs">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  </span>
                  Increased from yesterday
                </div>
              </div>
            </div>
          </div>

          {/* 2. Water Temperature */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest text-on-surface rounded-3xl p-3 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 60 Q 10 55, 20 60 T 40 65 T 60 60 T 80 55 T 100 60 L 100 100 L 0 100 Z" fill="#60a5fa"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-center">
                <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Reactor & Ambient Climate</h3>
                <button className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </button>
              </div>
              <div className="mt-2">
                <div className="text-[48px] font-bold text-on-surface mb-1 leading-none">
                  <span className="text-sm text-on-surface-variant block font-normal">Water:</span>
                  {telemetry.waterTemp}<span className="text-2xl text-on-surface-variant ml-1 font-normal">°C</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-surface-container text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-[14px]">thermostat</span>
                  </span>
                  Target: 20-30°C
                </div>
              </div>
              <div className="border-t border-outline-variant my-3"></div>
              <div className="text-[11px] text-on-surface-variant font-medium">
                Air: <span className="text-on-surface font-bold">{telemetry.ambientTemp}°C</span> | Hum: <span className="text-on-surface font-bold">{telemetry.humidity}%</span> | Press: <span className="text-on-surface font-bold">{telemetry.pressure} hPa</span>
              </div>
            </div>
          </div>

          {/* 3. Virtual Sensor: pH */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest text-on-surface rounded-3xl p-3 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 80 Q 25 75, 50 78 T 100 75 L 100 100 L 0 100 Z" fill="#818cf8"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Virtual Sensor: pH</h3>
                <div className="px-2 py-1 flex items-center rounded bg-secondary-fixed/10 text-secondary-fixed font-semibold text-[10px] border border-secondary/20">
                  <Bot className="w-3 h-3 mr-1" /> ML Predicted
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-[48px] font-bold text-on-surface leading-none">
                  {telemetry.predictedPh.toFixed(2)}
                </div>
                <div className="text-xs text-on-surface-variant mt-1">Stable range</div>
              </div>
            </div>
          </div>

          {/* 4. Virtual Sensor: O2 (DO) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest text-on-surface rounded-3xl p-3 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 70 Q 20 80, 40 70 T 60 75 T 80 65 T 100 70 L 100 100 L 0 100 Z" fill="#2dd4bf"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Virtual Sensor: O² (DO)</h3>
                <div className="px-2 py-1 flex items-center rounded bg-secondary-fixed/10 text-secondary-fixed font-semibold text-[10px] border border-secondary/20">
                  <Bot className="w-3 h-3 mr-1" /> ML Predicted
                </div>
              </div>
              <div className="mt-2">
                <div className="text-[48px] font-bold text-on-surface mb-1 leading-none">
                  {telemetry.predictedDo.toFixed(2)}<span className="text-xl text-on-surface-variant ml-1 font-normal">mg/L</span>
                </div>
                <div className="text-xs text-on-surface-variant">Optimal range maintained</div>
              </div>
            </div>
          </div>

          {/* 5. Biomass Trends (Chart) */}
          <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant flex flex-col motion-card min-h-0 font-clash min-h-[260px] shadow-md p-3 rounded-3xl opacity-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Biomass & Optical Density Trends</h3>
              <div className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">Daily Chlorophyll-A</div>
            </div>
            <div className="flex-1 flex flex-col relative mt-2 min-h-0">
              <div className="relative h-[200px] w-full -ml-4 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={biomassChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="biomassColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container-highest)', borderColor: 'var(--color-outline-variant)', borderRadius: '8px', color: 'var(--color-on-surface)' }}
                      itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#biomassColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 6. Automation System Status */}
          <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest text-on-surface rounded-3xl p-3 shadow-md relative overflow-hidden flex flex-col justify-between motion-card min-h-0 font-clash border border-outline-variant opacity-0">
            <div className="flex h-full w-full">
              <div className="w-[60%] flex flex-col justify-between relative z-10">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Carbon Capture & O² Yield</h3>
                  </div>
                  <div className="inline-block px-2 py-1 flex items-center w-max rounded-full bg-secondary-fixed/10 text-secondary-fixed font-bold text-[10px] border border-secondary/20 whitespace-nowrap mb-2">
                    <Leaf className="w-3 h-3 mr-1" /> Net Positive
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[48px] font-bold text-primary leading-none">
                      {(telemetry.algaeGrowthRate * 12.4).toFixed(1)}<span className="text-xl ml-1 text-on-surface-variant font-normal">g</span>
                    </div>
                    <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mt-1">Total CO₂ Absorbed</div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/30">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-on-surface">{(telemetry.algaeGrowthRate * 15.2).toFixed(1)}</span>
                      <span className="text-sm text-on-surface-variant">g</span>
                    </div>
                    <div className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">Total O₂ Produced</div>
                  </div>
                </div>
              </div>
              <div className="w-[40%] relative -mr-6 -my-6 overflow-hidden rounded-r-3xl">
                <img alt="Bioreactor Illustration" className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn4JNdEDB3qnQNJhoZ3Tp5qpwSLe0skw5wWlDkuzW0hdDYpfnzv1QgiCORyJzgp2opkGdxaWKt5RfKpxcZ5DQ4T7BAAHYw589Ujewx3F3TrihgeqEUovffvL_A4Jj-x_VRxPeDX3y9W3vJOM8AirpcxYq3gEnyYxpJKWWvQHQ-v4l_Hv3_Y6_GXZZyIzOcoDCZ75gZQJuoW_RlXgUJhbOPgSySOG2p1AG_0XTXTknW-NRJwZYX8LVc_eDx9703Isor19N-NtGirs8v" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface-container-lowest"></div>
              </div>
            </div>
          </div>

          {/* 7. Actuator Array */}
          <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest border border-outline-variant flex flex-col motion-card min-h-0 font-clash shadow-md p-3 rounded-3xl opacity-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">Actuator Array</h3>
              <button className="text-primary hover:bg-surface-container px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[14px]">add</span> New
              </button>
            </div>
            <ul className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 -mx-2 px-2">
              <ActuatorItem name="Inlet Pump" icon="water_pump" active={fsm.inletPump} />
              <ActuatorItem name="Outlet Pump" icon="valve" active={fsm.outletPump} />
              <ActuatorItem name="Air Compressor" icon="air" active={fsm.airCompressor} />
              <ActuatorItem name="LED Panel A" icon="light_mode" active={fsm.ledPanels} />
              <ActuatorItem name="LED Panel B" icon="lightbulb" active={false} />
            </ul>
          </div>

          {/* 8. Recent System Events & Logs */}
          <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant flex flex-col motion-card min-h-0 font-clash shadow-md p-3 rounded-3xl opacity-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">System Logs</h3>
              <button className="border border-outline-variant px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">View All</button>
            </div>
            <div className="flex-1 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
              <LogItem message="State shifted to AGITATING" time="05:14 PM" type="System" active={fsm.agitator} color="bg-primary" />
              <LogItem message="Water level refreshed" time="04:30 PM" type="Success" active={true} color="bg-secondary-fixed-dim" />
              <LogItem message="Virtual pH recalibrated via ML model" time="03:15 PM" type="Info" active={true} color="bg-surface-variant" />
            </div>
          </div>

          {/* 9. Reservoir Level (Gauge) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest border border-outline-variant flex flex-col items-center justify-center motion-card min-h-0 font-clash relative shadow-md p-3 rounded-3xl opacity-0">
            <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant absolute top-6 left-6">Reservoir Level</h3>
            <div className="relative w-32 h-48 mt-4 border-4 border-surface-container-highest rounded-3xl overflow-hidden bg-surface-container shadow-inner">
              <div className="absolute bottom-0 left-0 w-full bg-secondary-fixed-dim transition-all duration-1000 ease-in-out" style={{ height: `${telemetry.reservoirVolume}%` }}>
                <div className="absolute -top-2 left-0 w-[200%] h-8 bg-secondary-fixed-dim opacity-50 animate-pulse" style={{ borderRadius: '38% 42% 0 0', transform: 'translateX(-25%)' }}></div>
                <div className="absolute -top-3 left-0 w-[200%] h-8 bg-secondary-fixed-dim" style={{ borderRadius: '43% 37% 0 0', transform: 'translateX(-10%)' }}></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className="text-4xl font-bold text-on-surface drop-shadow-sm">{telemetry.reservoirVolume.toFixed(0)}%</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Volume</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between w-full text-xs font-semibold px-4">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span> Optimal Range</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-container-high"></span> Empty</div>
            </div>
          </div>

          {/* 10. FSM State Runtime (Compact Timer) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest rounded-3xl p-3 shadow-md text-on-surface flex flex-col motion-card min-h-0 font-clash relative overflow-hidden border border-primary/30 items-center justify-center gap-2 opacity-0">
            <div className="absolute inset-0 bg-primary/10"></div>
            <div className="relative z-10 flex justify-between items-center mb-2 w-full">
              <h3 className="font-satoshi text-[16px] font-semibold text-on-surface-variant">FSM Runtime</h3>
            </div>
            <div className="relative z-10 text-center my-auto">
              <div className="text-[40px] font-bold tracking-tight  text-on-surface">01:24:08</div>
              <div className="text-xs text-primary mt-1 uppercase tracking-widest font-bold">Active Phase</div>
            </div>
            <div className="relative z-10 flex justify-center gap-2 mt-3">
              <button className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center hover:bg-surface-variant transition-colors shadow-sm hover:scale-105 active:scale-95 border border-primary/20">
                <span className="material-symbols-outlined fill text-[20px]">pause</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-error/20 text-error flex items-center justify-center hover:bg-error/30 transition-colors shadow-sm hover:scale-105 active:scale-95 border border-error/20">
                <span className="material-symbols-outlined fill text-[20px]">stop</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ActuatorItem({ name, icon, active }: { name: string, icon: string, active: boolean }) {
  if (active) {
    return (
      <li className="flex items-center justify-between p-1.5 hover:bg-surface-container rounded-lg transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary-fixed/20 flex items-center justify-center text-secondary-fixed transition-colors">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
          <div>
            <div className="text-[14px] text-on-surface font-semibold">{name}</div>
          </div>
        </div>
        <span className="px-2 py-1 rounded text-[10px] font-bold bg-secondary-fixed/20 text-secondary-fixed">Active</span>
      </li>
    );
  }
  return (
    <li className="flex items-center justify-between p-1.5 hover:bg-surface-container rounded-lg transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
          <div className="text-[14px] text-on-surface font-semibold">{name}</div>
        </div>
      </div>
      <span className="px-2 py-1 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">Idle</span>
    </li>
  );
}

function LogItem({ message, time, type, active, color }: { message: string, time: string, type: string, active: boolean, color: string }) {
  if (!active) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant hover:shadow-sm p-2">
      <div className={`mt-1 w-2 h-2 rounded-full ${color} shrink-0`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-sm text-on-surface">{message}</span>
          <span className="text-xs text-on-surface-variant">{time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            type === 'System' ? 'bg-primary/10 text-primary' : 
            type === 'Success' ? 'bg-secondary-fixed/20 text-secondary-fixed' : 
            'bg-surface-container-high text-on-surface-variant'
          }`}>{type}</span>
        </div>
      </div>
    </div>
  );
}
