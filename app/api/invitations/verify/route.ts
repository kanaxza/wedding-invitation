import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { invitationCodeSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = invitationCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid invitation code format' },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    const invitation = await prisma.invitationCode.findUnique({
      where: { code },
      include: {
        group: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({
        ok: false,
        status: 'not_found',
      });
    }

    return NextResponse.json({
      ok: true,
      status: invitation.status,
      inviteeName: invitation.note,
      groupName: invitation.group.name,
    });
  } catch (error) {
    console.error('Error verifying invitation code:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
