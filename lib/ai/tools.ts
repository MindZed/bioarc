// lib/ai/tools.ts
// This file will contain the tools that will be used by the AI to interact with the bioreactor

import { tool } from 'ai';
import { z } from 'zod';

export const bioarcTools = {
  toggleActuator: tool({
    description: "Turn physical hardware devices on or off in the bioreactor.",
    parameters: z.object({
      device: z.enum(['Pump_12V', 'Wiper_Servo', 'LED_Grow']),
      state: z.boolean(),
    }),
    // @ts-ignore - TS fails to resolve the tool overload properly with explicit types
    execute: async ({ device, state }: { device: 'Pump_12V' | 'Wiper_Servo' | 'LED_Grow', state: boolean }) => {
      console.log('[TOOL] ⚙️ toggleActuator triggered for:', device);
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[TOOL] ✅ toggleActuator completed');
      return `Successfully set ${device} to ${state ? 'ON' : 'OFF'}.`;
    },
  }),

  getTelemetry: tool({
    description: "Get the current live sensor readings from the bioreactor.",
    parameters: z.object({}),
    // @ts-ignore - TS fails to resolve the tool overload properly with explicit types
    execute: async (_args: {}) => {
      console.log('[TOOL] 📊 getTelemetry triggered');
      console.log('[TOOL] ✅ getTelemetry completed');
      return {
        waterTemp: 24.5,
        pH: 7.2,
        dissolvedOxygen: 8.5,
        algaeGrowthRate: 1.2
      };
    },
  }),
};
