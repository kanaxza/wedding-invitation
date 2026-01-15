const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.fxdjxovseryrfufemoth:2ftrlj951Mx4YGw1@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const SQL = `
-- Add food preferences and allergic food columns to RSVP table
ALTER TABLE "RSVP" 
ADD COLUMN IF NOT EXISTS "foodPreferences" TEXT,
ADD COLUMN IF NOT EXISTS "allergicFood" TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN "RSVP"."foodPreferences" IS 'Pipe-separated list of food preferences (e.g., halalFood|vegetarianFood|Other:Custom text)';
COMMENT ON COLUMN "RSVP"."allergicFood" IS 'Free text field for allergic food information (max 200 chars)';
`;

async function migrateFoodPreferences() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected');
    
    console.log('\nAdding food preferences columns...');
    await client.query(SQL);
    console.log('✓ Migration completed successfully!');
    
    // Verify the changes
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'RSVP' 
      AND column_name IN ('foodPreferences', 'allergicFood')
      ORDER BY column_name;
    `);
    
    console.log('\n✓ New columns added:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

migrateFoodPreferences();
