// app/api/context/route.ts
// API route to add project context (knowledge base)

import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, keyword, content } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    if (!keyword || !content) {
      return NextResponse.json({ error: 'Keyword and content are required' }, { status: 400 });
    }

    await prisma.projectContext.create({
      data: {
        keyword,
        content,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to create context:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
