const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.fxdjxovseryrfufemoth:2ftrlj951Mx4YGw1@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const SQL = `
-- Step 1: Add groupId column (nullable first)
ALTER TABLE "InvitationCode" ADD COLUMN IF NOT EXISTS "groupId" TEXT;

-- Step 2: Create groups from existing groupName values and populate groupId
DO $$
DECLARE
  group_record RECORD;
  new_group_id TEXT;
BEGIN
  -- Create groups for each unique groupName
  FOR group_record IN 
    SELECT DISTINCT "groupName" FROM "InvitationCode" WHERE "groupName" IS NOT NULL
  LOOP
    -- Generate a simple ID
    new_group_id := 'grp_' || encode(gen_random_bytes(12), 'hex');
    
    -- Insert group if it doesn't exist
    INSERT INTO "Group" (id, name, "createdAt")
    VALUES (new_group_id, group_record."groupName", NOW())
    ON CONFLICT (name) DO NOTHING;
    
    -- Update InvitationCode with the group ID
    UPDATE "InvitationCode" 
    SET "groupId" = (SELECT id FROM "Group" WHERE name = group_record."groupName")
    WHERE "groupName" = group_record."groupName" AND "groupId" IS NULL;
  END LOOP;
END $$;

-- Step 3: Make groupId NOT NULL
ALTER TABLE "InvitationCode" ALTER COLUMN "groupId" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "InvitationCode" 
DROP CONSTRAINT IF EXISTS "InvitationCode_groupId_fkey";

ALTER TABLE "InvitationCode" 
ADD CONSTRAINT "InvitationCode_groupId_fkey" 
FOREIGN KEY ("groupId") REFERENCES "Group"(id) ON DELETE CASCADE;

-- Step 5: Create index
CREATE INDEX IF NOT EXISTS "InvitationCode_groupId_idx" ON "InvitationCode"("groupId");

-- Step 6: Drop old groupName column
ALTER TABLE "InvitationCode" DROP COLUMN IF EXISTS "groupName";
`;

async function migrateDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected');
    
    console.log('\nMigrating database schema...');
    await client.query(SQL);
    console.log('✓ Migration completed successfully!');
    
    // Verify the changes
    const groups = await client.query('SELECT * FROM "Group"');
    console.log(`\n✓ Groups created: ${groups.rows.length}`);
    
    const invitations = await client.query(`
      SELECT ic.code, ic."groupId", g.name as "groupName"
      FROM "InvitationCode" ic
      LEFT JOIN "Group" g ON ic."groupId" = g.id
      LIMIT 5
    `);
    
    if (invitations.rows.length > 0) {
      console.log('\n✓ Sample invitations with group relations:');
      invitations.rows.forEach(row => {
        console.log(`  - Code: ${row.code} -> Group: ${row.groupName}`);
      });
    }
    
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

migrateDatabase();
