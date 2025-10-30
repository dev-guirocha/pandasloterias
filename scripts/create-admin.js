#!/usr/bin/env node

/**
 * Script to create a default admin user
 * Run: node scripts/create-admin.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pandas_jcweb:Jj32631122%40@localhost:5432/pandasloterias',
});

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE role = $1 OR username = $2 OR email = $3',
      ['admin', 'admin', 'admin@pandasloterias.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists:');
      console.log('   Username:', existingAdmin.rows[0].username);
      console.log('   Email:', existingAdmin.rows[0].email);
      console.log('   Role:', existingAdmin.rows[0].role);
      await pool.end();
      return;
    }

    // Hash password: admin123
    const password = 'admin123';
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password, full_name, role, kyc_status, balance, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, email, role`,
      [
        'admin',
        'admin@pandasloterias.com',
        hashedPassword,
        'Administrador',
        'admin',
        'approved',
        '10000.00',
        true
      ]
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@pandasloterias.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Balance: R$ 10.000,00');

    await pool.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();

