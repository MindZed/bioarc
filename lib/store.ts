// lib/store.ts
import { create } from 'zustand';
import { 
  TelemetryData, FSMState, ChatSession, SystemLog, HardwareLifespan, 
  HistoricalDataPoint, generateMockTelemetry, generateMockFSM, 
  generateMockMaintenanceData, generateMockMetricsData 
} from './mockData';

let API_BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL || 'http://droplet.sewen.me:8080';

if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://').replace(':8080', '');
}

interface BioArcStore {
  isWsConnected: boolean;
  telemetry: TelemetryData;
  fsm: FSMState;
  fsmCurrentState: string;
  isSidebarCollapsed: boolean;
  chatHistory: ChatSession[];
  activeSessionId: string | null;
  fastMode: boolean;
  maintenanceLogs: SystemLog[];
  hardwareLifespan: HardwareLifespan[];
  selectedTimeRange: '7D' | '30D' | 'ALL';
  metricsData: HistoricalDataPoint[];
  
  // Real-time WebSocket Actions
  setWsConnected: (connected: boolean) => void;
  handleLiveTelemetry: (data: any) => void;
  sendActionCommand: (action: string) => Promise<boolean>;
  updateTelemetry: () => void;
  updateFSM: () => void;
  
  // UI & App Actions
  toggleSidebar: () => void;
  setActiveSession: (id: string | null) => void;
  createNewSession: () => Promise<void>;
  sendMessage: (content: string) => void;
  toggleFastMode: () => void;
  addMaintenanceLog: (message: string, severity: 'nominal' | 'warning' | 'critical') => void;
  setSelectedTimeRange: (range: '7D' | '30D' | 'ALL') => void;
  setChatHistory: (sessions: any[]) => void;
  deleteSession: (id: string) => void;
  updateSessionTitle: (id: string, newTitle: string) => void;
}

export const useStore = create<BioArcStore>((set, get) => ({
  isWsConnected: false,
  telemetry: generateMockTelemetry(),
  fsm: generateMockFSM(),
  fsmCurrentState: 'IDLE',
  isSidebarCollapsed: true,
  chatHistory: [],
  activeSessionId: null,
  fastMode: true,
  maintenanceLogs: generateMockMaintenanceData().logs,
  hardwareLifespan: generateMockMaintenanceData().hardware,
  selectedTimeRange: '7D',
  metricsData: generateMockMetricsData(7),

  setWsConnected: (connected) => set({ isWsConnected: connected }),
  updateTelemetry: () => {},
  updateFSM: () => {},

  handleLiveTelemetry: (data) => set((state) => {
    // Map live telemetry packet from Go Backend (contains sensor readings + ML predictions)
    // The Go backend wraps it in { type: 'telemetry', payload: { ... } }
    const t = data.payload || data;
    
    const newTelemetry: TelemetryData = {
      waterTemp: t.waterTemp ?? t.water_temp ?? state.telemetry.waterTemp,
      ambientTemp: t.airTemp ?? t.air_temp ?? state.telemetry.ambientTemp,
      humidity: t.humidity ?? state.telemetry.humidity,
      pressure: t.pressure ?? state.telemetry.pressure,
      reservoirVolume: t.levelCm ?? t.level_cm ? Math.max(0, 100 - ((t.levelCm ?? t.level_cm) * 3)) : state.telemetry.reservoirVolume,
      algaeGrowthRate: state.telemetry.algaeGrowthRate, // Formulaic calculated rate
      predictedPh: t.predictedPh ?? t.predicted_ph ?? state.telemetry.predictedPh,
      predictedDo: t.predictedDo ?? t.predicted_do ?? state.telemetry.predictedDo,
    };

    const newFSM: FSMState = {
      mode: state.fsm.mode,
      inletPump: t.relayIntake ?? t.relays?.intake ?? state.fsm.inletPump,
      outletPump: t.relayOuttake ?? t.relays?.outtake ?? state.fsm.outletPump,
      airCompressor: t.relayAir ?? t.relays?.air ?? state.fsm.airCompressor,
      ledPanels: t.relayLight ?? t.relays?.light ?? state.fsm.ledPanels,
      agitator: t.relayAgitator ?? t.relays?.agitator ?? state.fsm.agitator,
    };

    return {
      telemetry: newTelemetry,
      fsm: newFSM,
      fsmCurrentState: t.state || state.fsmCurrentState
    };
  }),

  sendActionCommand: async (action: string) => {
    try {
      console.log(`[API Command] Sending action: ${action} to ${API_BASE_URL}/api/command`);
      const response = await fetch(`${API_BASE_URL}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        console.log(`[API Command] Action ${action} executed successfully!`);
        get().addMaintenanceLog(`Command executed: ${action}`, 'nominal');
        return true;
      } else {
        console.error(`[API Command] Failed with status ${response.status}`);
        get().addMaintenanceLog(`Command failed: ${action}`, 'warning');
        return false;
      }
    } catch (err) {
      console.error(`[API Command] Network error sending command:`, err);
      get().addMaintenanceLog(`Network error sending command: ${action}`, 'critical');
      return false;
    }
  },

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setActiveSession: (id) => set({ activeSessionId: id }),
  createNewSession: async () => {
    set({ activeSessionId: 'new' });
  },
  sendMessage: (content) => set((state) => {
    if (!state.activeSessionId) return state;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const mockAiResponse = {
      id: `ai-${Date.now()}`,
      role: 'assistant' as const,
      content: "I've received your query. Analyzing live bioreactor telemetry...",
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
    const newHistory = state.chatHistory.filter(s => s.id !== id);
    const newActiveSessionId = state.activeSessionId === id 
      ? (newHistory.length > 0 ? newHistory[0].id : null) 
      : state.activeSessionId;
    return { chatHistory: newHistory, activeSessionId: newActiveSessionId };
  }),
  updateSessionTitle: (id, newTitle) => set((state) => ({
    chatHistory: state.chatHistory.map(s => s.id === id ? { ...s, title: newTitle } : s)
  })),
}));
