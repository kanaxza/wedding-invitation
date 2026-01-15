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
    // Get all RSVPs with invitation code and group
    const rsvps = await prisma.rSVP.findMany({
      include: {
        invitationCode: {
          include: {
            group: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

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
      },
      rsvps: rsvps.map((r) => ({
        id: r.id,
        code: r.invitationCode.code,
        phone: r.phone,
        attending: r.attending,
        guestsCount: r.guestsCount,
        foodPreferences: r.foodPreferences,
        allergicFood: r.allergicFood,
        updatedAt: r.updatedAt,
        createdAt: r.createdAt,
        groupName: r.invitationCode.group.name,
        inviteeName: r.invitationCode.inviteeName,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
