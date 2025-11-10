import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const recordCourtFee = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id, total_fee } = req.body;

    if (!practice_id || total_fee === undefined) {
      return res.status(400).json({ error: 'Practice ID and total fee are required' });
    }

    // Get participant count
    const participantResult = await pool.query(
      "SELECT COUNT(*) FROM participations WHERE practice_id = $1 AND status IN ('attending', 'late')",
      [practice_id]
    );

    const participantCount = parseInt(participantResult.rows[0].count);

    if (participantCount === 0) {
      return res.status(400).json({ error: 'No participants for this practice' });
    }

    const feePerPerson = Math.ceil(total_fee / participantCount);

    // Check if already exists
    const existingFee = await pool.query(
      'SELECT id FROM court_fees WHERE practice_id = $1',
      [practice_id]
    );

    let result;

    if (existingFee.rows.length > 0) {
      // Update existing
      result = await pool.query(
        'UPDATE court_fees SET total_fee = $1, participant_count = $2, fee_per_person = $3 WHERE practice_id = $4 RETURNING *',
        [total_fee, participantCount, feePerPerson, practice_id]
      );
    } else {
      // Create new
      result = await pool.query(
        'INSERT INTO court_fees (practice_id, total_fee, participant_count, fee_per_person) VALUES ($1, $2, $3, $4) RETURNING *',
        [practice_id, total_fee, participantCount, feePerPerson]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Record court fee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourtFee = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM court_fees WHERE practice_id = $1',
      [practice_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Court fee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get court fee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserCourtFeeStats = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id } = req.params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        COALESCE(SUM(cf.fee_per_person), 0) as total_paid,
        COUNT(DISTINCT p.practice_id) as practice_count
       FROM users u
       LEFT JOIN participations p ON u.id = p.user_id AND p.status IN ('attending', 'late')
       LEFT JOIN court_fees cf ON p.practice_id = cf.practice_id
       LEFT JOIN practices pr ON p.practice_id = pr.id
       WHERE u.id = $1 AND (pr.date IS NULL OR EXTRACT(YEAR FROM pr.date) = $2)
       GROUP BY u.id, u.name`,
      [user_id, currentYear]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user court fee stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsersCourtFeeStats = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        COALESCE(SUM(cf.fee_per_person), 0) as total_paid,
        COUNT(DISTINCT p.practice_id) as practice_count
       FROM users u
       LEFT JOIN participations p ON u.id = p.user_id AND p.status IN ('attending', 'late')
       LEFT JOIN court_fees cf ON p.practice_id = cf.practice_id
       LEFT JOIN practices pr ON p.practice_id = pr.id
       WHERE u.is_active = true AND (pr.date IS NULL OR EXTRACT(YEAR FROM pr.date) = $1)
       GROUP BY u.id, u.name
       ORDER BY total_paid DESC`,
      [currentYear]
    );

    // Get annual fee from settings
    const settingsResult = await pool.query(
      "SELECT value FROM settings WHERE key = 'annual_fee'"
    );

    const annualFee = parseInt(settingsResult.rows[0]?.value || '0');

    const statsWithDiff = result.rows.map(row => ({
      ...row,
      total_paid: parseInt(row.total_paid),
      practice_count: parseInt(row.practice_count),
      annual_fee: annualFee,
      difference: annualFee - parseInt(row.total_paid)
    }));

    res.json(statsWithDiff);
  } catch (error) {
    console.error('Get all users court fee stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
