// app/api/tools/execute/route.ts
// This file will be used to execute the tools

import { NextRequest, NextResponse } from 'next/server';
import { bioarcTools } from '@/lib/ai/tools';

export async function POST(req: NextRequest) {
  try {
    const { toolName, args } = await req.json();

    if (!toolName) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }

    const tool = bioarcTools[toolName as keyof typeof bioarcTools];

    if (!tool || !tool.execute) {
      return NextResponse.json({ error: `Tool ${toolName} not found or not executable` }, { status: 404 });
    }

    // @ts-ignore - The execute signature is internal to the AI SDK but we can call it directly
    const result = await tool.execute(args, { toolCallId: "live-proxy", messages: [] });

    // In case the result is an object or string, JSON stringify it to ensure it's a flat string for Gemini Live
    const stringOutput = typeof result === 'string' ? result : JSON.stringify(result);

    return NextResponse.json({ result: stringOutput });
  } catch (error: any) {
    console.error('Error executing tool proxy:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
