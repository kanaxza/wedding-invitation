import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rsvpFormSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitationCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { rsvp: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    if (invitation.status !== 'active') {
      return NextResponse.json(
        { error: 'This invitation code is no longer active' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      rsvp: invitation.rsvp || null,
    });
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = rsvpFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { code, phone, attending, guestsCount, foodPreferences, allergicFood } = validation.data;

    // Find the invitation code
    const invitation = await prisma.invitationCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    if (invitation.status !== 'active') {
      return NextResponse.json(
        { error: 'This invitation code is no longer active' },
        { status: 403 }
      );
    }

    // Upsert RSVP (update if exists, create if not)
    const rsvp = await prisma.rSVP.upsert({
      where: { invitationCodeId: invitation.id },
      update: {
        phone,
        attending,
        guestsCount: attending ? guestsCount : null,
        foodPreferences: foodPreferences || null,
        allergicFood: allergicFood || null,
      },
      create: {
        invitationCodeId: invitation.id,
        phone,
        attending,
        guestsCount: attending ? guestsCount : null,
        foodPreferences: foodPreferences || null,
        allergicFood: allergicFood || null,
      },
    });

    return NextResponse.json({
      success: true,
      rsvp,
    });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
