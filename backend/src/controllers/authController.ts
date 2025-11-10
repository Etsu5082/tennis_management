import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { AuthRequest as LoginRequest, RegisterRequest } from '../models/types';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, student_id, password }: RegisterRequest = req.body;

    if (!name || !student_id || !password) {
      return res.status(400).json({ error: 'All fields are required' });
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

    // Create user (inactive by default, needs admin approval)
    const result = await pool.query(
      'INSERT INTO users (name, student_id, password_hash, role, is_active, password_reset_required) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, student_id, role, is_active, password_reset_required',
      [name, student_id, passwordHash, 'member', false, false]
    );

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { student_id, password }: LoginRequest = req.body;
    console.log('Login attempt:', {
      student_id,
      password_length: password ? password.length : 0,
      password_actual: password // 一時的にパスワードを表示
    });

    if (!student_id || !password) {
      return res.status(400).json({ error: 'Student ID and password are required' });
    }

    // Get user
    const result = await pool.query(
      'SELECT id, name, student_id, email, password_hash, password_reset_required, role, is_active FROM users WHERE student_id = $1',
      [student_id]
    );
    console.log('User query result:', result.rows.length > 0 ? 'User found' : 'User not found');

    if (result.rows.length === 0) {
      console.log('Error: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('User data:', { id: user.id, student_id: user.student_id, is_active: user.is_active });

    // Check if user is active
    if (!user.is_active) {
      console.log('Error: User not active');
      return res.status(403).json({ error: 'Account not activated. Please wait for admin approval.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password validation:', isValidPassword ? 'Valid' : 'Invalid');

    if (!isValidPassword) {
      console.log('Error: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful, generating token...');

    // Generate token
    const token = generateToken({
      userId: user.id,
      studentId: user.student_id,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        student_id: user.student_id,
        email: user.email,
        role: user.role,
        password_reset_required: user.password_reset_required
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password and set password_reset_required to false
    await pool.query(
      'UPDATE users SET password_hash = $1, password_reset_required = FALSE WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
