import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  
  console.log('Summary endpoint - authenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all RSVPs for stats calculation
    const rsvps = await prisma.rSVP.findMany({
      select: {
        attending: true,
        guestsCount: true,
      },
    });

    // Get total invitation count efficiently
    const totalInvitations = await prisma.invitationCode.count();

    // Calculate summary stats
    const attending = rsvps.filter((r) => r.attending);
    const notAttending = rsvps.filter((r) => !r.attending);
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestsCount || 0), 0);

    return NextResponse.json({
      summary: {
        totalResponses: rsvps.length,
        attending: attending.length,
        notAttending: notAttending.length,
        totalGuests,
        totalInvitations, // Include total invitations count
      },
    });
  } catch (error) {
    console.error('Error fetching admin summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
