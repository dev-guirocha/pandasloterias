#!/usr/bin/env node

/**
 * Database Setup Script for PostgreSQL Local
 * This script creates the database and runs migrations
 */

import pkg from 'pg';
const { Client } = pkg;
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env file manually
try {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('⚠️ Arquivo .env não encontrado, usando variáveis do sistema');
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Parse database URL to get connection details
const url = new URL(DATABASE_URL);
const dbName = url.pathname.slice(1); // Remove leading slash
const dbHost = url.hostname;
const dbPort = url.port || 5432;
const dbUser = url.username;
const dbPassword = url.password;

console.log('🚀 Setting up PostgreSQL database...');
console.log(`📊 Database: ${dbName}`);
console.log(`🏠 Host: ${dbHost}:${dbPort}`);
console.log(`👤 User: ${dbUser}`);

async function createDatabase() {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`📝 Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Generate migrations if they don't exist
    console.log('📝 Generating migrations...');
    execSync('npm run db:generate', { stdio: 'inherit' });
    
    // Push schema to database
    console.log('📤 Pushing schema to database...');
    execSync('npm run db:push', { stdio: 'inherit' });
    
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await createDatabase();
    await runMigrations();
    
    console.log('\n🎉 Database setup completed!');
    console.log('📋 Next steps:');
    console.log('   1. Update your .env file with correct database credentials');
    console.log('   2. Run "npm install" to install dependencies');
    console.log('   3. Run "npm run dev" to start the development server');
    console.log('   4. Run "npm run db:studio" to open Drizzle Studio');
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

main();
