// app/api/chat/route.ts
// This file will be used to handle the chat requests from the frontend

import { streamText, ModelMessage, isStepCount } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { bioarcTools } from '@/lib/ai/tools';

interface ChatRequestBody {
  messages: ModelMessage[];
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[SERVER:${requestId}] 🟢 Incoming POST request`);
  console.time(`[SERVER:${requestId}] Total_Request_Time`);
  try {
    const body = (await req.json()) as ChatRequestBody;
    const querySessionId = req.nextUrl.searchParams.get('sessionId');
    let { messages, sessionId, fastMode } = body as any;

    // Default fastMode to true if it is not explicitly provided
    const isFastMode = fastMode !== false;

    // Fallback to query parameter if body doesn't contain it
    if (!sessionId && querySessionId) {
      sessionId = querySessionId;
    }

    console.log(`[SERVER:${requestId}] Incoming messages:`, JSON.stringify(messages));

    // Sanitize messages to ensure 'content' is present (compatibility with SDK versions)
    messages = messages.map((msg: any) => ({
      ...msg,
      content: msg.content !== undefined ? msg.content : (msg.parts ? msg.parts.map((p: any) => p.text || '').join('') : '')
    }));

    // Session Safety Check
    if (!sessionId) {
      const newSession = await prisma.chatSession.create({
        data: { title: "New AI Session" }
      });
      sessionId = newSession.id;
    } else {
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });
      if (!existingSession) {
        const newSession = await prisma.chatSession.create({
          data: { title: "New AI Session" }
        });
        sessionId = newSession.id;
      }
    }

    // Pre-Stream Database Write (User Message)
    const latestMessage = messages[messages.length - 1];
    let contentString = '';

    if (typeof latestMessage.content === 'string') {
      contentString = latestMessage.content;
    } else if (Array.isArray(latestMessage.content)) {
      contentString = latestMessage.content.map((part: any) => part.type === 'text' ? part.text : '').join('');
    }

    console.time(`[SERVER:${requestId}] DB_Pre_Save`);
    await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        role: 'user',
        content: contentString,
      }
    });
    console.timeEnd(`[SERVER:${requestId}] DB_Pre_Save`);

    const modelName = isFastMode ? 'gemini-3.5-flash' : 'gemma-4-31b-it';
    console.log(`[SERVER:${requestId}] 🧠 Calling Google AI API with model: ${modelName}`);

    const result = streamText({
      model: google(modelName),
      system: "You are the BioArc Reactor AI. You manage a physical algae bioreactor. You have tools to control hardware and read telemetry. IMPORTANT: If the user asks general questions about the BioArc project, its creators, goals, or how it works, you MUST execute a two-step search: 1) Call getKnowledgeBaseTopics to see what keywords exist. 2) Call searchKnowledgeBase using the EXACT keywords you found in step 1. Do not guess keywords. Only use tools if explicitly necessary.",
      messages,
      tools: bioarcTools,
      stopWhen: isStepCount(5), // Increased from 3 to 5 to allow multi-step tool use
      onFinish: async (event) => {
        try {
          console.log(`[SERVER:${requestId}] 🏁 AI Stream finished. Starting background DB save.`);
          console.time(`[SERVER:${requestId}] DB_Post_Save`);
          await prisma.chatMessage.create({
            data: {
              sessionId: sessionId!,
              role: 'assistant',
              content: event.text,
            }
          });
          console.timeEnd(`[SERVER:${requestId}] DB_Post_Save`);
          console.timeEnd(`[SERVER:${requestId}] Total_Request_Time`);
        } catch (dbError) {
          console.error('Failed to save AI response to DB:', dbError);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
