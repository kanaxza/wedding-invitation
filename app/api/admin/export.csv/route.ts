import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rsvps = await prisma.rSVP.findMany({
      include: {
        invitationCode: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Generate CSV
    const headers = [
      'Code',
      'Name',
      'Phone',
      'Attending',
      'Guests Count',
      'Created At',
      'Updated At',
    ];

    const rows = rsvps.map((r) => [
      r.invitationCode.code,
      r.name,
      r.phone,
      r.attending ? 'Yes' : 'No',
      r.guestsCount?.toString() || '-',
      r.createdAt.toISOString(),
      r.updatedAt.toISOString(),
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
        'Content-Disposition': `attachment; filename="rsvp-export-${new Date().toISOString().split('T')[0]}.csv"`,
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
