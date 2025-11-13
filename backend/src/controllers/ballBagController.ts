import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createBallBag = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      'INSERT INTO ball_bags (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create ball bag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllBallBags = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT bb.*, u.name as current_holder_name
       FROM ball_bags bb
       LEFT JOIN users u ON bb.current_holder_id = u.id
       ORDER BY bb.id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ball bags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const recordBallBagTakeaway = async (req: AuthRequest, res: Response) => {
  try {
    const { ball_bag_id, practice_id, user_id } = req.body;

    if (!ball_bag_id || !practice_id || !user_id) {
      return res.status(400).json({ error: 'Ball bag ID, practice ID, and user ID are required' });
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Record history
      await client.query(
        'INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id) VALUES ($1, $2, $3)',
        [ball_bag_id, practice_id, user_id]
      );

      // Update current holder
      await client.query(
        'UPDATE ball_bags SET current_holder_id = $1 WHERE id = $2',
        [user_id, ball_bag_id]
      );

      await client.query('COMMIT');

      res.status(201).json({ message: 'Ball bag takeaway recorded successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Record ball bag takeaway error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBallBagHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { ball_bag_id } = req.params;

    const result = await pool.query(
      `SELECT bbh.*, u.name as user_name, p.date as practice_date
       FROM ball_bag_histories bbh
       JOIN users u ON bbh.user_id = u.id
       JOIN practices p ON bbh.practice_id = p.id
       WHERE bbh.ball_bag_id = $1
       ORDER BY bbh.taken_at DESC`,
      [ball_bag_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ball bag history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBallBagHolders = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id } = req.params;

    // Get participants for the practice
    const participantsResult = await pool.query(
      `SELECT DISTINCT p.user_id, u.name
       FROM participations p
       JOIN users u ON p.user_id = u.id
       WHERE p.practice_id = $1 AND p.status IN ('attending', 'late')`,
      [practice_id]
    );

    if (participantsResult.rows.length === 0) {
      return res.json([]);
    }

    const userIds = participantsResult.rows.map((r: any) => r.user_id);

    // Get ball bags held by participants
    const result = await pool.query(
      `SELECT bb.id as ball_bag_id, bb.name as ball_bag_name, u.id as user_id, u.name as user_name
       FROM ball_bags bb
       JOIN users u ON bb.current_holder_id = u.id
       WHERE bb.current_holder_id = ANY($1)
       ORDER BY bb.id`,
      [userIds]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ball bag holders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBallBagStats = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    console.log('Getting ball bag stats for year:', currentYear);

    const result = await pool.query(
      `SELECT u.id as user_id, u.name as user_name, COUNT(bbh.id)::INTEGER as takeaway_count
       FROM ball_bag_histories bbh
       JOIN users u ON u.id = bbh.user_id
       JOIN practices p ON bbh.practice_id = p.id
       WHERE EXTRACT(YEAR FROM p.date) = $1
       GROUP BY u.id, u.name
       HAVING COUNT(bbh.id) > 0
       ORDER BY takeaway_count DESC, u.name`,
      [currentYear]
    );

    console.log('Stats result:', JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (error) {
    console.error('Get ball bag stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Auto-assign ball bag holders based on practice courts and participant history
export const autoAssignBallBagHolders = async (req: AuthRequest, res: Response) => {
  try {
    const { practice_id } = req.body;

    if (!practice_id) {
      return res.status(400).json({ error: 'Practice ID is required' });
    }

    // Get practice details
    const practiceResult = await pool.query(
      'SELECT * FROM practices WHERE id = $1',
      [practice_id]
    );

    if (practiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    const practice = practiceResult.rows[0];
    const requiredBallBags = practice.courts; // 1面につき1個

    // Get attending participants (exclude late)
    const participantsResult = await pool.query(
      `SELECT DISTINCT p.user_id, u.name
       FROM participations p
       JOIN users u ON p.user_id = u.id
       WHERE p.practice_id = $1 AND p.status = 'attending'`,
      [practice_id]
    );

    if (participantsResult.rows.length === 0) {
      return res.status(400).json({ error: 'No attending participants found' });
    }

    // Get participants with their last takeaway date (oldest first)
    const candidatesResult = await pool.query(
      `SELECT
        u.id as user_id,
        u.name,
        MAX(bbh.taken_at) as last_takeaway_date
       FROM users u
       INNER JOIN participations p ON u.id = p.user_id
       LEFT JOIN ball_bag_histories bbh ON u.id = bbh.user_id
       WHERE p.practice_id = $1 AND p.status = 'attending'
       GROUP BY u.id, u.name
       ORDER BY last_takeaway_date ASC NULLS FIRST, u.name`,
      [practice_id]
    );

    const candidates = candidatesResult.rows;

    if (candidates.length < requiredBallBags) {
      return res.status(400).json({
        error: `Not enough attending participants. Required: ${requiredBallBags}, Available: ${candidates.length}`
      });
    }

    // Get available ball bags
    const ballBagsResult = await pool.query(
      'SELECT * FROM ball_bags ORDER BY id LIMIT $1',
      [requiredBallBags]
    );

    if (ballBagsResult.rows.length < requiredBallBags) {
      return res.status(400).json({
        error: `Not enough ball bags. Required: ${requiredBallBags}, Available: ${ballBagsResult.rows.length}`
      });
    }

    // Assign ball bags to selected participants
    const client = await pool.connect();
    const assignments = [];

    try {
      await client.query('BEGIN');

      for (let i = 0; i < requiredBallBags; i++) {
        const ballBag = ballBagsResult.rows[i];
        const participant = candidates[i];

        // Record history
        await client.query(
          'INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id) VALUES ($1, $2, $3)',
          [ballBag.id, practice_id, participant.user_id]
        );

        // Update current holder
        await client.query(
          'UPDATE ball_bags SET current_holder_id = $1 WHERE id = $2',
          [participant.user_id, ballBag.id]
        );

        assignments.push({
          ball_bag_id: ballBag.id,
          ball_bag_name: ballBag.name,
          user_id: participant.user_id,
          user_name: participant.name
        });
      }

      await client.query('COMMIT');

      res.json({
        message: 'Ball bag holders assigned successfully',
        assignments
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Auto assign ball bag holders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
