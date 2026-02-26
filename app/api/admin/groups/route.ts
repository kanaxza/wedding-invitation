import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

// GET all groups
export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if minimal query parameter is set for dropdown filters
    const { searchParams } = new URL(request.url);
    const minimal = searchParams.get('minimal') === 'true';

    if (minimal) {
      // Only fetch id and name for dropdown filters
      const groups = await prisma.group.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ groups });
    }

    // Full groups data for the groups table
    const groups = await prisma.group.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new group
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, tableLabel } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tableLabel: tableLabel?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update group
export async function PATCH(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, tableLabel } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tableLabel: tableLabel?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE group
export async function DELETE(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Check if group is being used by any invitation
    const invitationsUsingGroup = await prisma.invitationCode.count({
      where: { groupId: id },
    });

    if (invitationsUsingGroup > 0) {
      return NextResponse.json(
        { error: `Cannot delete group: ${invitationsUsingGroup} invitation(s) are using this group` },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
