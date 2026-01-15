import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.fxdjxovseryrfufemoth:2ftrlj951Mx4YGw1@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
  
  try {
    await prisma.$connect();
    console.log('✓ Successfully connected to database');
    
    // Test a simple query
    const result: any = await prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;
    console.log('✓ Query successful:', result);
    
    // List tables
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('✓ Existing tables:');
    tables.forEach((t: any) => console.log('  -', t.table_name));
    
    if (tables.length === 0) {
      console.log('\n⚠ No tables found. Need to run: npx prisma db push');
    }
    
  } catch (error: any) {
    console.error('✗ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
