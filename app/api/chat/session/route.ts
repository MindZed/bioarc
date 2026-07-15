import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const newSession = await prisma.chatSession.create({
      data: { title: "New AI Session" }
    });
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Cascade delete handles messages, or we delete messages first if cascade isn't set.
    // To be safe, we'll explicitly delete messages first.
    await prisma.chatMessage.deleteMany({
      where: { sessionId: sessionId },
    });

    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sessionId, title } = await req.json();

    if (!sessionId || !title) {
      return NextResponse.json({ error: 'Session ID and title are required' }, { status: 400 });
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: title },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Failed to rename session:', error);
    return NextResponse.json({ error: 'Failed to rename session' }, { status: 500 });
  }
}
