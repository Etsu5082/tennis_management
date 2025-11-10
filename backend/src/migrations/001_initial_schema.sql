-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  line_notify_token VARCHAR(255),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('default_deadline_days', '4', 'デフォルト締め切り日数'),
  ('default_deadline_time', '23:59', 'デフォルト締め切り時刻'),
  ('default_capacity_per_court', '8', 'デフォルト1面あたり定員'),
  ('reserve_ratio', '0.1', '面数削減の予備人数計算比率'),
  ('annual_fee', '0', '年会費金額'),
  ('line_notify_group_token', '', 'LINE Notifyグループトークン');

-- Practices table
CREATE TABLE practices (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location VARCHAR(255) NOT NULL,
  courts INTEGER NOT NULL,
  capacity_per_court INTEGER NOT NULL DEFAULT 8,
  deadline_datetime TIMESTAMP NOT NULL,
  court_fee_per_court INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed', 'cancelled')),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participations table
CREATE TABLE participations (
  id SERIAL PRIMARY KEY,
  practice_id INTEGER NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'late', 'absent', 'waitlist')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(practice_id, user_id)
);

-- Ball bags table
CREATE TABLE ball_bags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  current_holder_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ball bag histories table
CREATE TABLE ball_bag_histories (
  id SERIAL PRIMARY KEY,
  ball_bag_id INTEGER NOT NULL REFERENCES ball_bags(id) ON DELETE CASCADE,
  practice_id INTEGER NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Court fees table
CREATE TABLE court_fees (
  id SERIAL PRIMARY KEY,
  practice_id INTEGER NOT NULL UNIQUE REFERENCES practices(id) ON DELETE CASCADE,
  total_fee INTEGER NOT NULL,
  participant_count INTEGER NOT NULL,
  fee_per_person INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_practices_date ON practices(date);
CREATE INDEX idx_practices_status ON practices(status);
CREATE INDEX idx_participations_practice_id ON participations(practice_id);
CREATE INDEX idx_participations_user_id ON participations(user_id);
CREATE INDEX idx_participations_status ON participations(status);
CREATE INDEX idx_ball_bag_histories_user_id ON ball_bag_histories(user_id);
CREATE INDEX idx_ball_bag_histories_practice_id ON ball_bag_histories(practice_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_practices_updated_at BEFORE UPDATE ON practices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participations_updated_at BEFORE UPDATE ON participations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ball_bags_updated_at BEFORE UPDATE ON ball_bags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_court_fees_updated_at BEFORE UPDATE ON court_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
