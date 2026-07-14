// lib/ai/tools.ts
// This file will contain the tools that will be used by the AI to interact with the bioreactor

import { tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/db';

export const bioarcTools = {
  getKnowledgeBaseTopics: tool({
    description: "Always call this FIRST before searching the knowledge base. It returns a list of all valid topics/keywords currently available in the database.",
    parameters: z.object({}),
    // @ts-ignore
    execute: async () => {
      console.log('[TOOL] 🗂️ Fetching knowledge base index...');
      const records = await prisma.projectContext.findMany({
        select: { keyword: true }
      });
      if (records.length === 0) return "The knowledge base is currently empty.";
      const topics = records.map(r => r.keyword).join(', ');
      return `Available keywords to search: ${topics}`;
    }
  }),
  searchKnowledgeBase: tool({
    description: "Search the BioArc project database for facts, goals, architecture, and documentation. Use this whenever the user asks general questions about what BioArc is, how it works, or who built it.",
    parameters: z.object({
      query: z.string().describe('A comma-separated list of up to 3 short root keywords (e.g., "goal, future scope, hardware"). NEVER pass full sentences. Extract the core nouns from the user request.'),
    }),
    // @ts-ignore - TS fails to resolve the tool overload properly with explicit types
    execute: async ({ query }: { query?: string }) => {
      let keywords: string[] = [];
      if (typeof query === 'string' && query.trim()) {
        try {
          // Sometimes the AI hallucinates a stringified JSON array
          const parsed = JSON.parse(query);
          if (Array.isArray(parsed)) {
            keywords = parsed.map(String);
          } else {
            keywords = [String(parsed)];
          }
        } catch {
          // If the AI hallucinates a full sentence, clean it and split by spaces OR commas
          keywords = query
            .replace(/[^a-zA-Z0-9 ,]/g, '') // Strip special chars
            .split(/[\s,]+/)                // Split by comma or space
            .map(k => k.trim())
            .filter(k => k.length > 3);     // Drop short words like 'the', 'is', 'of'
            
          // If the word was exactly 3 letters or less (like "aim"), but we dropped everything
          if (keywords.length === 0) {
            keywords = query.split(',').map(k => k.replace(/[^a-zA-Z0-9 -]/g, '').trim()).filter(Boolean);
          }
        }
      }

      console.log('[TOOL] 🔎 Multi-query search for:', keywords);
      
      if (keywords.length === 0) {
        return "No valid keywords provided for search.";
      }
    
      // Dynamically build the OR conditions for every keyword provided
      const orConditions = keywords.flatMap(kw => [
        { keyword: { contains: kw, mode: 'insensitive' as const } },
        { content: { contains: kw, mode: 'insensitive' as const } }
      ]);
      
      const records = await prisma.projectContext.findMany({
        where: { OR: orConditions },
        take: 5 
      });

      console.log(`[TOOL] 🔎 Found ${records.length} records in Prisma`);
      
      if (records.length === 0) return "No data found for these keywords.";
    
      return records.map(r => `Knowledge (Keyword: ${r.keyword}): ${r.content}`).join('\n\n');
    },
  }),
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
