-- Create court_reservations table to store reservation account information
CREATE TABLE IF NOT EXISTS court_reservations (
  id SERIAL PRIMARY KEY,
  practice_id INTEGER NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  user_number VARCHAR(20) NOT NULL,
  student_id VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_court_reservations_practice_id ON court_reservations(practice_id);
CREATE INDEX idx_court_reservations_user_number ON court_reservations(user_number);

COMMENT ON TABLE court_reservations IS 'Court reservation account information (予約アカウント情報)';
COMMENT ON COLUMN court_reservations.practice_id IS 'Related practice ID';
COMMENT ON COLUMN court_reservations.user_name IS 'Reservation account holder name (予約名義人氏名)';
COMMENT ON COLUMN court_reservations.user_number IS 'Reservation account user number (利用者番号)';
COMMENT ON COLUMN court_reservations.student_id IS 'Student ID of reservation account holder (学籍番号)';
