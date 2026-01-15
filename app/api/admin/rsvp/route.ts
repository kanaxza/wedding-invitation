import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { invitationCodeId, phone, attending, guestsCount, foodPreferences, allergicFood } = body;

    if (!invitationCodeId) {
      return NextResponse.json(
        { error: 'Invitation code ID is required' },
        { status: 400 }
      );
    }

    // Check if invitation exists
    const invitation = await prisma.invitationCode.findUnique({
      where: { id: invitationCodeId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Create or update RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: { invitationCodeId },
      update: {
        phone: phone || '',
        attending,
        guestsCount: attending ? guestsCount : null,
        foodPreferences: foodPreferences || null,
        allergicFood: allergicFood || null,
      },
      create: {
        invitationCodeId,
        phone: phone || '',
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
    console.error('Error creating/updating RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rsvpId, phone, attending, guestsCount, foodPreferences, allergicFood } = body;

    if (!rsvpId) {
      return NextResponse.json(
        { error: 'RSVP ID is required' },
        { status: 400 }
      );
    }

    const rsvp = await prisma.rSVP.update({
      where: { id: rsvpId },
      data: {
        phone: phone || '',
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
    console.error('Error updating RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const rsvpId = searchParams.get('rsvpId');

    if (!rsvpId) {
      return NextResponse.json(
        { error: 'RSVP ID is required' },
        { status: 400 }
      );
    }

    await prisma.rSVP.delete({
      where: { id: rsvpId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
