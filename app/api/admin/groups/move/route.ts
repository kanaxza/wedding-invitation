import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

// POST move all guests from one group to another
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fromGroupId, toGroupId } = body;

    if (!fromGroupId || !toGroupId) {
      return NextResponse.json(
        { error: 'Both source and destination group IDs are required' },
        { status: 400 }
      );
    }

    if (fromGroupId === toGroupId) {
      return NextResponse.json(
        { error: 'Source and destination groups must be different' },
        { status: 400 }
      );
    }

    // Verify both groups exist
    const [fromGroup, toGroup] = await Promise.all([
      prisma.group.findUnique({ where: { id: fromGroupId } }),
      prisma.group.findUnique({ where: { id: toGroupId } }),
    ]);

    if (!fromGroup) {
      return NextResponse.json({ error: 'Source group not found' }, { status: 404 });
    }
    if (!toGroup) {
      return NextResponse.json({ error: 'Destination group not found' }, { status: 404 });
    }

    const result = await prisma.invitationCode.updateMany({
      where: { groupId: fromGroupId },
      data: { groupId: toGroupId },
    });

    return NextResponse.json({
      success: true,
      movedCount: result.count,
    });
  } catch (error) {
    console.error('Error moving guests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
