import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validations';
import { verifyAdminPassword, setAdminAuth, clearAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = adminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    if (verifyAdminPassword(password)) {
      await setAdminAuth();
      console.log('Admin authenticated successfully');
      return NextResponse.json({ success: true });
    }

    console.log('Invalid password attempt');
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in admin login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearAdminAuth();
  return NextResponse.json({ success: true });
}
