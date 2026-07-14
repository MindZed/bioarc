// lib/store.ts
// This file will be used to handle the state management of the application

import { create } from 'zustand';
import { TelemetryData, FSMState, ChatSession, SystemLog, HardwareLifespan, HistoricalDataPoint, generateMockTelemetry, generateMockFSM, generateMockChatHistory, generateMockMaintenanceData, generateMockMetricsData } from './mockData';

interface BioArcStore {
  telemetry: TelemetryData;
  fsm: FSMState;
  isSidebarCollapsed: boolean;
  chatHistory: ChatSession[];
  activeSessionId: string | null;
  fastMode: boolean;
  maintenanceLogs: SystemLog[];
  hardwareLifespan: HardwareLifespan[];
  selectedTimeRange: '7D' | '30D' | 'ALL';
  metricsData: HistoricalDataPoint[];
  updateTelemetry: () => void;
  updateFSM: () => void;
  toggleSidebar: () => void;
  setActiveSession: (id: string | null) => void;
  createNewSession: () => void;
  sendMessage: (content: string) => void;
  toggleFastMode: () => void;
  addMaintenanceLog: (message: string, severity: 'nominal' | 'warning' | 'critical') => void;
  setSelectedTimeRange: (range: '7D' | '30D' | 'ALL') => void;
  setChatHistory: (sessions: any[]) => void;
  deleteSession: (id: string) => void;
}

export const useStore = create<BioArcStore>((set) => ({
  telemetry: generateMockTelemetry(),
  fsm: generateMockFSM(),
  isSidebarCollapsed: false,
  chatHistory: generateMockChatHistory(),
  activeSessionId: null,
  fastMode: false,
  maintenanceLogs: generateMockMaintenanceData().logs,
  hardwareLifespan: generateMockMaintenanceData().hardware,
  selectedTimeRange: '7D',
  metricsData: generateMockMetricsData(7),
  updateTelemetry: () => set({ telemetry: generateMockTelemetry() }),
  updateFSM: () => set({ fsm: generateMockFSM() }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setActiveSession: (id) => set({ activeSessionId: id }),
  createNewSession: () => set((state) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: "New AI Session",
      date: "Just now",
      messages: [{ id: "welcome", role: "assistant", content: "Hello. I am BioArc AI. How can I assist you with the bioreactor telemetry today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    };
    return {
      chatHistory: [newSession, ...state.chatHistory],
      activeSessionId: newSession.id
    };
  }),
  sendMessage: (content) => set((state) => {
    if (!state.activeSessionId) return state;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Simulate AI response
    const mockAiResponse = {
      id: `ai-${Date.now()}`,
      role: 'assistant' as const,
      content: "I've received your query. Analyzing telemetry data... (Mock Response)",
      timestamp: now
    };

    const newHistory = state.chatHistory.map(session => {
      if (session.id === state.activeSessionId) {
        return {
          ...session,
          messages: [
            ...session.messages,
            { id: `msg-${Date.now()}`, role: 'user' as const, content, timestamp: now },
            mockAiResponse
          ]
        };
      }
      return session;
    });

    return { chatHistory: newHistory };
  }),
  toggleFastMode: () => set((state) => ({ fastMode: !state.fastMode })),
  addMaintenanceLog: (message, severity) => set((state) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity,
      message,
    };
    return { maintenanceLogs: [newLog, ...state.maintenanceLogs] };
  }),
  setSelectedTimeRange: (range) => set({ 
    selectedTimeRange: range, 
    metricsData: generateMockMetricsData(range === '7D' ? 7 : range === '30D' ? 30 : 90) 
  }),
  setChatHistory: (sessions) => set({ chatHistory: sessions }),
  deleteSession: (id) => set((state) => {
    const newHistory = state.chatHistory.filter(session => session.id !== id);
    const newActiveSessionId = state.activeSessionId === id 
      ? (newHistory.length > 0 ? newHistory[0].id : null) 
      : state.activeSessionId;
    return { chatHistory: newHistory, activeSessionId: newActiveSessionId };
  }),
}));
