import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, inviteeName } = body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    if (!inviteeName || typeof inviteeName !== 'string' || inviteeName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invitee name is required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.invitationCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This invitation code already exists' },
        { status: 400 }
      );
    }

    // Create invitation code
    const invitation = await prisma.invitationCode.create({
      data: {
        code: code.trim().toUpperCase(),
        note: inviteeName.trim(),
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.error('Error creating invitation code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invitations = await prisma.invitationCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rsvp: true,
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitation codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Verify admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, inviteeName } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (inviteeName !== undefined && inviteeName.trim()) {
      updateData.note = inviteeName.trim();
    }

    const invitation = await prisma.invitationCode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.error('Error updating invitation code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    await prisma.invitationCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invitation code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
