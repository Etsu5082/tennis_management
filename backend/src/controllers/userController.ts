import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { parse } from 'csv-parse/sync';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, student_id, registration_number, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, student_id, email, role, line_notify_token, is_active, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_active = true WHERE id = $1 RETURNING id, name, student_id, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User approved successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, line_notify_token } = req.body;

    // Only allow users to update their own profile (except admins)
    if (req.user?.role !== 'admin' && req.user?.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (line_notify_token !== undefined) {
      updates.push(`line_notify_token = $${paramCount}`);
      values.push(line_notify_token);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, line_notify_token`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, student_id, password, role, is_active, password_reset_required } = req.body;

    if (!name || !student_id || !password) {
      return res.status(400).json({ error: 'Name, student_id, and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE student_id = $1',
      [student_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Student ID already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (admin can set role and is_active)
    const userRole = role || 'member';
    const userIsActive = is_active !== undefined ? is_active : true;
    const requirePasswordReset = password_reset_required !== undefined ? password_reset_required : false;

    const result = await pool.query(
      'INSERT INTO users (name, student_id, password_hash, role, is_active, password_reset_required) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, student_id, role, is_active, password_reset_required, created_at',
      [name, student_id, passwordHash, userRole, userIsActive, requirePasswordReset]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const importUsersFromCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    // Parse CSV
    const records = parse(csvData, {
      skip_empty_lines: true,
      from_line: 2, // Skip header row
    });

    const createdUsers = [];
    const errors = [];

    for (const record of records) {
      try {
        // Try to detect CSV format
        let name, student_id, registration_number;

        // Check if it's users1.csv format (Name,Kana,Year,user_number,password,...)
        if (record.length >= 5 && record[3] && record[4]) {
          name = record[0]; // Column 1: Name
          registration_number = record[3]; // Column 4: user_number
          student_id = record[4]; // Column 5: password (actual student_id)
        } else {
          // Original format (名前,カタカナ,性別,学年,学部,学科,学籍番号,...)
          name = record[0]; // Column 1: Name
          student_id = record[6]; // Column 7: Student ID (0-indexed: column 6)
          registration_number = record[14]; // Column 15: Registration Number (0-indexed: column 14)
        }

        if (!name || !student_id) {
          errors.push({ student_id: student_id || 'unknown', error: 'Missing name or student_id' });
          continue;
        }

        // Check if user already exists
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE student_id = $1',
          [student_id]
        );

        if (existingUser.rows.length > 0) {
          errors.push({ student_id, error: 'Student ID already registered' });
          continue;
        }

        // Hash password (student_id is the initial password)
        const passwordHash = await bcrypt.hash(student_id, 10);

        // Create user with password_reset_required = true
        const result = await pool.query(
          'INSERT INTO users (name, student_id, registration_number, password_hash, role, is_active, password_reset_required) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, student_id, registration_number',
          [name, student_id, registration_number || null, passwordHash, 'member', true, true]
        );

        createdUsers.push(result.rows[0]);
      } catch (err: any) {
        errors.push({ student_id: record[6], error: err.message });
      }
    }

    res.json({
      message: `Successfully created ${createdUsers.length} users`,
      created: createdUsers,
      errors: errors,
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
