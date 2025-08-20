# SQL Files

This folder contains all Supabase SQL scripts and schema files.

## Schema Files
- `supabase-schema.sql` - Main database schema
- `supabase-schema-fixed.sql` - Fixed version of the schema
- `supabase-triggers.sql` - Database triggers

## Migration Scripts
- `safe-schema-migration.sql` - Safe migration script for existing databases
- `migrate-cards-table.sql` - Cards table migration
- `add-csv-columns.sql` - Add CSV-related columns
- `create-cards-table-exact-match.sql` - Create cards table with exact structure

## Fix Scripts
- `fix-cards-table.sql` - Fix cards table structure
- `fix-cards-rls.sql` - Fix Row Level Security for cards table
- `fix-card-sets-table.sql` - Fix card_sets table structure and RLS
- `fix-collection-rls.sql` - Fix RLS for collection tables
- `fix-missing-collections.sql` - Fix missing collections for users
- `fix-missing-collections-v2.sql` - Updated version of missing collections fix
- `fix-auth-cookies.sql` - Fix authentication cookies
- `fix-duplicate-productid.sql` - Fix duplicate product IDs

## Debug Scripts
- `debug-collection.sql` - Debug collection issues
- `check-cards-structure.sql` - Check cards table structure
- `check-table-structure.sql` - Check table structures
- `test-collection-simple.sql` - Simple collection test

## Utility Scripts
- `apply-schema-fix.sql` - Apply schema fixes
- `cleanup-schema.sql` - Clean up schema

## Usage
Run these scripts in your Supabase SQL editor in the order specified in the file names or as needed for specific issues.
