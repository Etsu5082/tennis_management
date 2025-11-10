-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (name, student_id, password_hash, role, is_active)
VALUES (
  '管理者',
  'ADMIN001',
  '$2b$10$pr918QxBCApnaPppGDJCY.eMhY.Q2349H1m76Y9V6OVvfeATvkFZ.',
  'admin',
  true
)
ON CONFLICT (student_id) DO NOTHING;
