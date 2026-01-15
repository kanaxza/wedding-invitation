const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.fxdjxovseryrfufemoth:2ftrlj951Mx4YGw1@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

const SQL = `
-- Create Group table
CREATE TABLE IF NOT EXISTS "Group" (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create InvitationCode table
CREATE TABLE IF NOT EXISTS "InvitationCode" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  note TEXT,
  "groupName" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create RSVP table
CREATE TABLE IF NOT EXISTS "RSVP" (
  id TEXT PRIMARY KEY,
  "invitationCodeId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  attending BOOLEAN NOT NULL,
  "guestsCount" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RSVP_invitationCodeId_fkey" FOREIGN KEY ("invitationCodeId") 
    REFERENCES "InvitationCode"(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "InvitationCode_groupName_idx" ON "InvitationCode"("groupName");
CREATE INDEX IF NOT EXISTS "RSVP_invitationCodeId_idx" ON "RSVP"("invitationCodeId");
`;

async function createTables() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected');
    
    console.log('\nCreating tables...');
    await client.query(SQL);
    console.log('✓ Tables created successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nTables in database:');
    result.rows.forEach(row => console.log('  -', row.table_name));
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTables();
