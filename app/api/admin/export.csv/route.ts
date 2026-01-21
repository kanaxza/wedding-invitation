import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invitations = await prisma.invitationCode.findMany({
      include: {
        group: true,
        rsvp: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate CSV
    const headers = [
      'Code',
      'Group Name',
      'Invitee Name',
      'Status',
      'RSVP Status',
      'Guests Count',
      'Food Preferences',
      'Allergic Food',
      'Updated At',
    ];

    const rows = invitations.map((inv) => [
      inv.code,
      inv.group.name,
      inv.inviteeName || '-',
      inv.status,
      inv.rsvp ? (inv.rsvp.attending ? 'Attending' : 'Not Attending') : 'No Response',
      inv.rsvp?.guestsCount?.toString() || '-',
      inv.rsvp?.foodPreferences || '-',
      inv.rsvp?.allergicFood || '-',
      inv.rsvp?.updatedAt.toISOString() || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="invitations-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
