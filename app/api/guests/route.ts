import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { description: 'desc' },
      include: {
        invitationCodes: {
          orderBy: { inviteeName: 'asc' },
          include: {
            rsvp: true,
          },
        },
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching guest groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
