-- Demo data for testing ball bag functionality
-- This adds sample users, practices, ball bags, and takeaway records

-- Insert demo users (members)
INSERT INTO users (name, student_id, password_hash, role, is_active) VALUES
  ('田中太郎', 'MEM001', '$2b$10$pr918QxBCApnaPppGDJCY.eMhY.Q2349H1m76Y9V6OVvfeATvkFZ.', 'member', true),
  ('佐藤花子', 'MEM002', '$2b$10$pr918QxBCApnaPppGDJCY.eMhY.Q2349H1m76Y9V6OVvfeATvkFZ.', 'member', true),
  ('鈴木一郎', 'MEM003', '$2b$10$pr918QxBCApnaPppGDJCY.eMhY.Q2349H1m76Y9V6OVvfeATvkFZ.', 'member', true),
  ('高橋美咲', 'MEM004', '$2b$10$pr918QxBCApnaPppGDJCY.eMhY.Q2349H1m76Y9V6OVvfeATvkFZ.', 'member', true),
  ('渡辺健太', 'MEM005', '$2b$10$pr918QxBCApnaPppGDJCY.eMhY.Q2349H1m76Y9V6OVvfeATvkFZ.', 'member', true)
ON CONFLICT (student_id) DO NOTHING;

-- Insert demo practices (upcoming and past)
INSERT INTO practices (date, start_time, end_time, location, courts, capacity_per_court, deadline_datetime, court_fee_per_court, status, notes, created_by) VALUES
  -- Upcoming practices
  (CURRENT_DATE + INTERVAL '3 days', '14:00', '17:00', '城北中央公園', 2, 8, CURRENT_TIMESTAMP + INTERVAL '2 days', 3600, 'open', 'デモ用練習日程1', 1),
  (CURRENT_DATE + INTERVAL '7 days', '10:00', '13:00', '光が丘公園', 3, 8, CURRENT_TIMESTAMP + INTERVAL '6 days', 3600, 'open', 'デモ用練習日程2', 1),
  (CURRENT_DATE + INTERVAL '10 days', '15:00', '18:00', '木場公園', 2, 8, CURRENT_TIMESTAMP + INTERVAL '9 days', 3600, 'open', 'デモ用練習日程3', 1),
  -- Past practices (for history)
  (CURRENT_DATE - INTERVAL '7 days', '14:00', '17:00', '城北中央公園', 2, 8, CURRENT_TIMESTAMP - INTERVAL '8 days', 3600, 'completed', '過去の練習1', 1),
  (CURRENT_DATE - INTERVAL '14 days', '10:00', '13:00', '光が丘公園', 2, 8, CURRENT_TIMESTAMP - INTERVAL '15 days', 3600, 'completed', '過去の練習2', 1)
ON CONFLICT DO NOTHING;

-- Insert demo ball bags
INSERT INTO ball_bags (name, current_holder_id) VALUES
  ('ボルバA', NULL),
  ('ボルバB', NULL),
  ('ボルバC', NULL)
ON CONFLICT DO NOTHING;

-- Get IDs for the demo data we just inserted
DO $$
DECLARE
  user1_id INT;
  user2_id INT;
  user3_id INT;
  user4_id INT;
  user5_id INT;
  practice1_id INT;
  practice2_id INT;
  practice3_id INT;
  past_practice1_id INT;
  past_practice2_id INT;
  ballbag1_id INT;
  ballbag2_id INT;
  ballbag3_id INT;
BEGIN
  -- Get user IDs
  SELECT id INTO user1_id FROM users WHERE student_id = 'MEM001';
  SELECT id INTO user2_id FROM users WHERE student_id = 'MEM002';
  SELECT id INTO user3_id FROM users WHERE student_id = 'MEM003';
  SELECT id INTO user4_id FROM users WHERE student_id = 'MEM004';
  SELECT id INTO user5_id FROM users WHERE student_id = 'MEM005';

  -- Get practice IDs
  SELECT id INTO practice1_id FROM practices WHERE date = CURRENT_DATE + INTERVAL '3 days' AND location = '城北中央公園';
  SELECT id INTO practice2_id FROM practices WHERE date = CURRENT_DATE + INTERVAL '7 days' AND location = '光が丘公園';
  SELECT id INTO practice3_id FROM practices WHERE date = CURRENT_DATE + INTERVAL '10 days' AND location = '木場公園';
  SELECT id INTO past_practice1_id FROM practices WHERE date = CURRENT_DATE - INTERVAL '7 days' AND location = '城北中央公園';
  SELECT id INTO past_practice2_id FROM practices WHERE date = CURRENT_DATE - INTERVAL '14 days' AND location = '光が丘公園';

  -- Get ball bag IDs
  SELECT id INTO ballbag1_id FROM ball_bags WHERE name = 'ボルバA';
  SELECT id INTO ballbag2_id FROM ball_bags WHERE name = 'ボルバB';
  SELECT id INTO ballbag3_id FROM ball_bags WHERE name = 'ボルバC';

  -- Insert participations for upcoming practices
  IF practice1_id IS NOT NULL THEN
    INSERT INTO participations (practice_id, user_id, status) VALUES
      (practice1_id, user1_id, 'attending'),
      (practice1_id, user2_id, 'attending'),
      (practice1_id, user3_id, 'attending'),
      (practice1_id, user4_id, 'attending')
    ON CONFLICT DO NOTHING;
  END IF;

  IF practice2_id IS NOT NULL THEN
    INSERT INTO participations (practice_id, user_id, status) VALUES
      (practice2_id, user1_id, 'attending'),
      (practice2_id, user3_id, 'attending'),
      (practice2_id, user5_id, 'attending')
    ON CONFLICT DO NOTHING;
  END IF;

  IF practice3_id IS NOT NULL THEN
    INSERT INTO participations (practice_id, user_id, status) VALUES
      (practice3_id, user2_id, 'attending'),
      (practice3_id, user4_id, 'attending'),
      (practice3_id, user5_id, 'attending')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert participations for past practices
  IF past_practice1_id IS NOT NULL THEN
    INSERT INTO participations (practice_id, user_id, status) VALUES
      (past_practice1_id, user1_id, 'attending'),
      (past_practice1_id, user2_id, 'attending'),
      (past_practice1_id, user3_id, 'attending')
    ON CONFLICT DO NOTHING;
  END IF;

  IF past_practice2_id IS NOT NULL THEN
    INSERT INTO participations (practice_id, user_id, status) VALUES
      (past_practice2_id, user2_id, 'attending'),
      (past_practice2_id, user4_id, 'attending'),
      (past_practice2_id, user5_id, 'attending')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert ball bag takeaway history (past practices)
  IF past_practice1_id IS NOT NULL AND ballbag1_id IS NOT NULL THEN
    INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id, taken_at) VALUES
      (ballbag1_id, past_practice1_id, user1_id, CURRENT_TIMESTAMP - INTERVAL '7 days')
    ON CONFLICT DO NOTHING;

    -- Update current holder
    UPDATE ball_bags SET current_holder_id = user1_id WHERE id = ballbag1_id;
  END IF;

  IF past_practice2_id IS NOT NULL AND ballbag2_id IS NOT NULL THEN
    INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id, taken_at) VALUES
      (ballbag2_id, past_practice2_id, user2_id, CURRENT_TIMESTAMP - INTERVAL '14 days')
    ON CONFLICT DO NOTHING;

    -- Update current holder
    UPDATE ball_bags SET current_holder_id = user2_id WHERE id = ballbag2_id;
  END IF;

  -- Add one more history entry for user3 to show multiple takeaways
  IF past_practice1_id IS NOT NULL AND ballbag3_id IS NOT NULL THEN
    INSERT INTO ball_bag_histories (ball_bag_id, practice_id, user_id, taken_at) VALUES
      (ballbag3_id, past_practice1_id, user3_id, CURRENT_TIMESTAMP - INTERVAL '7 days')
    ON CONFLICT DO NOTHING;

    -- Update current holder
    UPDATE ball_bags SET current_holder_id = user3_id WHERE id = ballbag3_id;
  END IF;

END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Demo data inserted successfully!';
  RAISE NOTICE 'Users: MEM001-MEM005 (password: admin123)';
  RAISE NOTICE 'Practices: 3 upcoming, 2 past';
  RAISE NOTICE 'Ball bags: 3 bags with takeaway history';
END $$;
