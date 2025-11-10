import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createParticipation = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id, status } = req.body;
    const user_id = req.user?.userId;

    if (!practice_id || !status) {
      return res.status(400).json({ error: 'Practice ID and status are required' });
    }

    // Check if practice exists and is open
    const practiceResult = await pool.query(
      'SELECT * FROM practices WHERE id = $1',
      [practice_id]
    );

    if (practiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    const practice = practiceResult.rows[0];

    if (practice.status !== 'open') {
      return res.status(400).json({ error: 'Practice is not open for registration' });
    }

    // Check deadline
    if (new Date() > new Date(practice.deadline_datetime)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if already registered
    const existingParticipation = await pool.query(
      'SELECT id FROM participations WHERE practice_id = $1 AND user_id = $2',
      [practice_id, user_id]
    );

    if (existingParticipation.rows.length > 0) {
      // Update existing participation
      const result = await pool.query(
        'UPDATE participations SET status = $1 WHERE practice_id = $2 AND user_id = $3 RETURNING *',
        [status, practice_id, user_id]
      );
      return res.json(result.rows[0]);
    }

    // Check capacity
    const participantCount = await pool.query(
      "SELECT COUNT(*) FROM participations WHERE practice_id = $1 AND status IN ('attending', 'late')",
      [practice_id]
    );

    const totalCapacity = practice.courts * practice.capacity_per_court;
    const currentCount = parseInt(participantCount.rows[0].count);

    let finalStatus = status;
    if (status === 'attending' && currentCount >= totalCapacity) {
      finalStatus = 'waitlist';
    }

    // Create participation
    const result = await pool.query(
      'INSERT INTO participations (practice_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [practice_id, user_id, finalStatus]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create participation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParticipationsByPractice = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM participations p
       JOIN users u ON p.user_id = u.id
       WHERE p.practice_id = $1
       ORDER BY p.created_at ASC`,
      [practice_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get participations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyParticipations = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;

    const result = await pool.query(
      `SELECT p.*, pr.date, pr.start_time, pr.location, pr.status as practice_status
       FROM participations p
       JOIN practices pr ON p.practice_id = pr.id
       WHERE p.user_id = $1
       ORDER BY pr.date DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my participations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteParticipation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;
    console.log('Delete participation request:', { id, user_id, role: req.user?.role });

    // Only allow users to delete their own participation
    if (req.user?.role !== 'admin') {
      const result = await pool.query(
        'SELECT user_id FROM participations WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Participation not found' });
      }

      if (result.rows[0].user_id !== user_id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    await pool.query('DELETE FROM participations WHERE id = $1', [id]);

    res.json({ message: 'Participation deleted successfully' });
  } catch (error) {
    console.error('Delete participation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParticipationStats = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id } = req.params;

    const result = await pool.query(
      `SELECT
        status,
        COUNT(*) as count
       FROM participations
       WHERE practice_id = $1
       GROUP BY status`,
      [practice_id]
    );

    const stats = {
      attending: 0,
      late: 0,
      absent: 0,
      waitlist: 0
    };

    result.rows.forEach(row => {
      stats[row.status as keyof typeof stats] = parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('Get participation stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
