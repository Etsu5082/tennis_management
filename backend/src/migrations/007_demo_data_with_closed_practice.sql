-- Demo data: Closed practice with ball bag assignments
-- This creates a practice that is past deadline but before the practice date

-- Insert a practice that is closed (deadline passed) but upcoming
INSERT INTO practices (date, start_time, end_time, location, courts, capacity_per_court, deadline_datetime, court_fee_per_court, status, notes, created_by) VALUES
  (CURRENT_DATE + INTERVAL '2 days', '14:00', '17:00', '城北中央公園テニスコート', 2, 8, CURRENT_TIMESTAMP - INTERVAL '1 hour', 3600, 'closed', '締切済み・ボルバ担当者指名済みのデモ練習', 1)
ON CONFLICT DO NOTHING;

-- Get the practice ID
DO $$
DECLARE
  demo_practice_id INT;
  user1_id INT;
  user2_id INT;
  user3_id INT;
  user4_id INT;
  user5_id INT;
  admin_id INT;
  ballbag1_id INT;
  ballbag2_id INT;
BEGIN
  -- Get practice ID
  SELECT id INTO demo_practice_id FROM practices
  WHERE date = CURRENT_DATE + INTERVAL '2 days'
  AND location = '城北中央公園テニスコート'
  AND status = 'closed'
  LIMIT 1;

  -- Get user IDs
  SELECT id INTO admin_id FROM users WHERE student_id = 'ADMIN001';
  SELECT id INTO user1_id FROM users WHERE student_id = 'MEM001';
  SELECT id INTO user2_id FROM users WHERE student_id = 'MEM002';
  SELECT id INTO user3_id FROM users WHERE student_id = 'MEM003';
  SELECT id INTO user4_id FROM users WHERE student_id = 'MEM004';
  SELECT id INTO user5_id FROM users WHERE student_id = 'MEM005';

  -- Get ball bag IDs
  SELECT id INTO ballbag1_id FROM ball_bags WHERE name = 'ボルバA' LIMIT 1;
  SELECT id INTO ballbag2_id FROM ball_bags WHERE name = 'ボルバB' LIMIT 1;

  IF demo_practice_id IS NOT NULL THEN
    -- Insert participations (締切後の確定メンバー)
    INSERT INTO participations (practice_id, user_id, status) VALUES
      (demo_practice_id, admin_id, 'attending'),
      (demo_practice_id, user1_id, 'attending'),
      (demo_practice_id, user2_id, 'attending'),
      (demo_practice_id, user3_id, 'attending'),
      (demo_practice_id, user4_id, 'late'),
      (demo_practice_id, user5_id, 'attending')
    ON CONFLICT DO NOTHING;

    -- Assign ball bags to participants (担当者指名)
    IF ballbag1_id IS NOT NULL THEN
      INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id, taken_at) VALUES
        (ballbag1_id, demo_practice_id, user1_id, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING;

      UPDATE ball_bags SET current_holder_id = user1_id WHERE id = ballbag1_id;
    END IF;

    IF ballbag2_id IS NOT NULL THEN
      INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id, taken_at) VALUES
        (ballbag2_id, demo_practice_id, user3_id, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING;

      UPDATE ball_bags SET current_holder_id = user3_id WHERE id = ballbag2_id;
    END IF;

    RAISE NOTICE '締切済み練習のデモデータを作成しました';
    RAISE NOTICE '日程: % 14:00-17:00', CURRENT_DATE + INTERVAL '2 days';
    RAISE NOTICE '参加者: 6名（うち1名遅刻予定）';
    RAISE NOTICE 'ボルバA担当: 田中太郎（MEM001）';
    RAISE NOTICE 'ボルバB担当: 鈴木一郎（MEM003）';
  ELSE
    RAISE NOTICE '練習データの作成に失敗しました';
  END IF;
END $$;
