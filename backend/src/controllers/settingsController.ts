import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllSettings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY key');

    const settings: { [key: string]: any } = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description
      };
    });

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    console.log('Get setting request for key:', key);

    const result = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);
    console.log('Setting query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('Setting not found for key:', key);
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const result = await pool.query(
      'UPDATE settings SET value = $1 WHERE key = $2 RETURNING *',
      [value, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
