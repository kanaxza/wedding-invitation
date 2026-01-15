import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

// Generate random 8-character invitation code
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Parse CSV content
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    // Filter out empty lines and comment lines (starting with #)
    return trimmed.length > 0 && !trimmed.startsWith('#');
  });

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim());
    if (row.length === headers.length) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

interface ImportResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; code?: string; inviteeName: string; error: string }>;
  imported: Array<{ code: string; inviteeName: string; groupName: string }>;
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    
    // Parse CSV
    const { headers, rows } = parseCSV(content);

    // Validate headers
    const requiredHeaders = ['code', 'inviteeName', 'groupId', 'note'];
    const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));
    
    if (!hasAllHeaders) {
      return NextResponse.json(
        { error: `CSV must have these columns: ${requiredHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Get column indices
    const codeIdx = headers.indexOf('code');
    const inviteeNameIdx = headers.indexOf('inviteeName');
    const groupIdIdx = headers.indexOf('groupId');
    const noteIdx = headers.indexOf('note');

    // Fetch all groups for validation
    const groups = await prisma.group.findMany({
      select: { id: true, name: true },
    });
    const groupMap = new Map(groups.map(g => [g.id, g.name]));

    // Fetch existing codes
    const existingCodes = await prisma.invitationCode.findMany({
      select: { code: true },
    });
    const existingCodesSet = new Set(existingCodes.map(ic => ic.code));

    const result: ImportResult = {
      success: true,
      successCount: 0,
      errorCount: 0,
      errors: [],
      imported: [],
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because: 1-indexed + header row

      let code = row[codeIdx]?.trim().toUpperCase() || '';
      const inviteeName = row[inviteeNameIdx]?.trim() || '';
      const groupId = row[groupIdIdx]?.trim() || '';
      const note = row[noteIdx]?.trim() || '';

      // Validate required fields
      if (!inviteeName) {
        result.errors.push({
          row: rowNumber,
          code,
          inviteeName: inviteeName || '(empty)',
          error: 'inviteeName is required',
        });
        result.errorCount++;
        continue;
      }

      if (!groupId) {
        result.errors.push({
          row: rowNumber,
          code,
          inviteeName,
          error: 'groupId is required',
        });
        result.errorCount++;
        continue;
      }

      // Validate group exists
      if (!groupMap.has(groupId)) {
        result.errors.push({
          row: rowNumber,
          code,
          inviteeName,
          error: `groupId "${groupId}" does not exist`,
        });
        result.errorCount++;
        continue;
      }

      // Generate code if empty
      if (!code) {
        let attempts = 0;
        do {
          code = generateCode();
          attempts++;
        } while ((existingCodesSet.has(code) || result.imported.some(imp => imp.code === code)) && attempts < 100);

        if (attempts >= 100) {
          result.errors.push({
            row: rowNumber,
            code: '(auto-generate failed)',
            inviteeName,
            error: 'Failed to generate unique code after 100 attempts',
          });
          result.errorCount++;
          continue;
        }
      }

      // Check for duplicate code
      if (existingCodesSet.has(code)) {
        result.errors.push({
          row: rowNumber,
          code,
          inviteeName,
          error: `Code "${code}" already exists in database`,
        });
        result.errorCount++;
        continue;
      }

      // Check for duplicate in current import
      if (result.imported.some(imp => imp.code === code)) {
        result.errors.push({
          row: rowNumber,
          code,
          inviteeName,
          error: `Code "${code}" appears multiple times in CSV`,
        });
        result.errorCount++;
        continue;
      }

      // Create invitation code
      try {
        // @ts-ignore - TypeScript having issues with Prisma types, but this works at runtime
        const created = await prisma.invitationCode.create({
          data: {
            code: code,
            inviteeName: inviteeName + (note ? ` - ${note}` : ''),
            groupId: groupId,
            status: 'active',
          },
        });

        result.imported.push({
          code,
          inviteeName,
          groupName: (groupMap.get(groupId) as string) || '',
        });
        result.successCount++;
        existingCodesSet.add(code); // Add to set to prevent duplicates in same import
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          code,
          inviteeName,
          error: `Failed to create: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        result.errorCount++;
      }
    }

    result.success = result.errorCount === 0;

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
