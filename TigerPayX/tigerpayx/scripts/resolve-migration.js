#!/usr/bin/env node
/**
 * Script to resolve failed Prisma migrations
 * This marks the old failed SQLite migration as rolled back
 */

const { PrismaClient } = require('@prisma/client');

async function resolveFailedMigration() {
  const prisma = new PrismaClient();
  
  try {
    // Check if the failed migration exists
    const failedMigration = await prisma.$queryRaw`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = '20251121105935_defi_rewrite' 
      AND finished_at IS NULL
    `;
    
    if (failedMigration && failedMigration.length > 0) {
      console.log('Found failed migration, marking as rolled back...');
      
      // Mark the migration as rolled back by deleting it
      await prisma.$executeRaw`
        DELETE FROM "_prisma_migrations" 
        WHERE migration_name = '20251121105935_defi_rewrite'
      `;
      
      console.log('✓ Failed migration resolved');
    } else {
      console.log('No failed migration found');
    }
  } catch (error) {
    // If the table doesn't exist or there's an error, that's okay
    // The migration system will handle it
    console.log('Migration resolution skipped:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resolveFailedMigration();

