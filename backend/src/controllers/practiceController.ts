import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createPractice = async (req: AuthRequest, res: Response) => {
  try {
    const {
      date,
      start_time,
      end_time,
      location,
      courts,
      capacity_per_court,
      deadline_datetime,
      court_fee_per_court,
      notes
    } = req.body;

    if (!date || !start_time || !location || !courts || !deadline_datetime) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const result = await pool.query(
      `INSERT INTO practices
       (date, start_time, end_time, location, courts, capacity_per_court, deadline_datetime, court_fee_per_court, notes, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open')
       RETURNING *`,
      [
        date,
        start_time,
        end_time,
        location,
        courts,
        capacity_per_court || 8,
        deadline_datetime,
        court_fee_per_court || 0,
        notes,
        req.user?.userId
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllPractices = async (req: AuthRequest, res: Response) => {
  try {
    const { status, from_date, to_date } = req.query;

    let query = 'SELECT * FROM practices';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (from_date) {
      conditions.push(`date >= $${paramCount}`);
      values.push(from_date);
      paramCount++;
    }

    if (to_date) {
      conditions.push(`date <= $${paramCount}`);
      values.push(to_date);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC, start_time DESC';

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Get practices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPractice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM practices WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    // Get reservation accounts for this practice
    const reservationsResult = await pool.query(
      'SELECT user_name, user_number, student_id FROM court_reservations WHERE practice_id = $1',
      [id]
    );

    res.json({
      ...result.rows[0],
      reservation_accounts: reservationsResult.rows,
    });
  } catch (error) {
    console.error('Get practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePractice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      date,
      start_time,
      end_time,
      location,
      courts,
      capacity_per_court,
      deadline_datetime,
      court_fee_per_court,
      status,
      notes
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (date) {
      updates.push(`date = $${paramCount}`);
      values.push(date);
      paramCount++;
    }

    if (start_time) {
      updates.push(`start_time = $${paramCount}`);
      values.push(start_time);
      paramCount++;
    }

    if (end_time !== undefined) {
      updates.push(`end_time = $${paramCount}`);
      values.push(end_time);
      paramCount++;
    }

    if (location) {
      updates.push(`location = $${paramCount}`);
      values.push(location);
      paramCount++;
    }

    if (courts) {
      updates.push(`courts = $${paramCount}`);
      values.push(courts);
      paramCount++;
    }

    if (capacity_per_court) {
      updates.push(`capacity_per_court = $${paramCount}`);
      values.push(capacity_per_court);
      paramCount++;
    }

    if (deadline_datetime) {
      updates.push(`deadline_datetime = $${paramCount}`);
      values.push(deadline_datetime);
      paramCount++;
    }

    if (court_fee_per_court !== undefined) {
      updates.push(`court_fee_per_court = $${paramCount}`);
      values.push(court_fee_per_court);
      paramCount++;
    }

    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE practices SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePractice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM practices WHERE id = $1', [id]);

    res.json({ message: 'Practice deleted successfully' });
  } catch (error) {
    console.error('Delete practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const importPracticesFromText = async (req: AuthRequest, res: Response) => {
  try {
    const { textData } = req.body;
    const userId = req.user?.userId;

    if (!textData) {
      return res.status(400).json({ error: 'Text data is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse the "予約回数集計結果" section
    const lines = textData.split('\n');
    const summaryStartIndex = lines.findIndex((line: string) => line.includes('予約回数集計結果'));

    if (summaryStartIndex === -1) {
      return res.status(400).json({ error: '予約回数集計結果セクションが見つかりません' });
    }

    const createdPractices = [];
    const errors = [];

    // Parse each practice entry
    for (let i = summaryStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match: 利用日: 2025年07月04日, 時刻: 11時00分, 面数: 1
      const practiceMatch = line.match(/利用日:\s*(\d{4})年(\d{2})月(\d{2})日,\s*時刻:\s*(\d{1,2})時(\d{2})分,\s*面数:\s*(\d+)/);

      if (practiceMatch) {
        const [, year, month, day, hour, minute, courts] = practiceMatch;
        const date = `${year}-${month}-${day}`;
        const startTime = `${hour.padStart(2, '0')}:${minute}`;

        // Calculate end time (2 hours later)
        const endHour = (parseInt(hour) + 2).toString().padStart(2, '0');
        const endTime = `${endHour}:${minute}`;

        // Set deadline to 1 day before at 23:59
        const deadlineDate = new Date(date);
        deadlineDate.setDate(deadlineDate.getDate() - 1);
        deadlineDate.setHours(23, 59, 0, 0);

        try {
          // Check for duplicate practice (same date and start_time)
          const duplicateCheck = await pool.query(
            'SELECT id FROM practices WHERE date = $1 AND start_time = $2',
            [date, startTime]
          );

          if (duplicateCheck.rows.length > 0) {
            // Skip this practice as it already exists
            errors.push(`${date} ${startTime} の練習は既に存在するためスキップしました`);
            continue;
          }

          // Create practice
          const practiceResult = await pool.query(
            `INSERT INTO practices
             (date, start_time, end_time, location, courts, capacity_per_court, deadline_datetime, court_fee_per_court, notes, created_by, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open')
             RETURNING *`,
            [
              date,
              startTime,
              endTime,
              '', // Empty location - to be set manually later
              parseInt(courts),
              10, // Default capacity per court
              deadlineDate.toISOString(),
              3600, // Default court fee per court
              'テキストファイルからインポート',
              userId,
            ]
          );

          const practice = practiceResult.rows[0];

          // Parse reservation accounts for this practice
          const reservationAccounts = [];
          let j = i + 1;
          while (j < lines.length && lines[j].trim().startsWith('利用者氏名:')) {
            const accountMatch = lines[j].match(/利用者氏名:\s*(.+?),\s*利用者番号:\s*(\d+)/);
            if (accountMatch) {
              const [, userName, userNumber] = accountMatch;
              reservationAccounts.push({ userName, userNumber });
            }
            j++;
          }

          // Insert reservation accounts
          for (const account of reservationAccounts) {
            // Try to find student_id from users table by registration_number
            const userResult = await pool.query(
              'SELECT student_id FROM users WHERE registration_number = $1',
              [account.userNumber]
            );

            const studentId = userResult.rows.length > 0 ? userResult.rows[0].student_id : null;

            await pool.query(
              'INSERT INTO court_reservations (practice_id, user_name, user_number, student_id) VALUES ($1, $2, $3, $4)',
              [practice.id, account.userName, account.userNumber, studentId]
            );
          }

          createdPractices.push({
            ...practice,
            reservation_accounts: reservationAccounts,
          });
        } catch (err: any) {
          errors.push({ date, error: err.message });
        }
      }
    }

    res.json({
      message: `Successfully created ${createdPractices.length} practices`,
      created: createdPractices,
      errors: errors,
    });
  } catch (error) {
    console.error('Import practices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
