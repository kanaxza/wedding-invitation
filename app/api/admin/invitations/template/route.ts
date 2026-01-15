import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all groups from database
    const groups = await prisma.group.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    // Build CSV content
    const lines: string[] = [];
    
    // Instructions section
    lines.push('# INSTRUCTIONS - How to use this template:');
    lines.push('# 1. Fill in the invitation data rows below (after the header row)');
    lines.push('# 2. code: OPTIONAL - Leave empty to auto-generate a unique code');
    lines.push('# 3. inviteeName: REQUIRED - Name of the person being invited');
    lines.push('# 4. groupId: REQUIRED - Copy from the GROUPS REFERENCE section below');
    lines.push('# 5. note: OPTIONAL - Any additional notes about this invitation');
    lines.push('# 6. Delete the example rows before importing');
    lines.push('# 7. Save this file and import it in the admin panel');
    lines.push('');
    
    // Header row
    lines.push('code,inviteeName,groupId,note');
    
    // Example rows
    const exampleGroupId = groups.length > 0 ? groups[0].id : '[PASTE_GROUP_ID_HERE]';
    lines.push(`SAMPLE1,John Doe,${exampleGroupId},VIP guest - example with custom code`);
    lines.push(`,Jane Smith,${exampleGroupId},Example with auto-generated code (empty code field)`);
    lines.push(`SAMPLE2,Bob Wilson,${exampleGroupId},Another example`);
    lines.push('');
    
    // Groups reference section
    lines.push('# ============================================================');
    lines.push('# GROUPS REFERENCE - Copy groupId from here');
    lines.push('# ============================================================');
    lines.push('# groupId,groupName');
    
    for (const group of groups) {
      lines.push(`# ${group.id},${group.name}`);
    }
    
    if (groups.length === 0) {
      lines.push('# No groups found. Please create groups first.');
    }

    // Join all lines
    const csvContent = lines.join('\n');

    // Return as downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="invitation_codes_template.csv"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
