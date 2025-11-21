-- Resolve failed migration from old SQLite migration
-- This migration marks the old failed migration as rolled back
-- so that new migrations can be applied

-- Delete the failed migration record if it exists
-- This is safe because the old migration was for SQLite and we're now using PostgreSQL
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251121105935_defi_rewrite';

