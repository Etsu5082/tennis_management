-- Migration: Change email to student_id and add password_reset_required
-- This migration converts the authentication system from email to student ID

-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE;

-- Copy email to student_id for existing users (temporary measure)
UPDATE users SET student_id = email WHERE student_id IS NULL;

-- Make student_id NOT NULL after populating it
ALTER TABLE users ALTER COLUMN student_id SET NOT NULL;

-- Update existing admin user with a sample student ID
UPDATE users SET
  student_id = 'ADMIN001',
  password_reset_required = FALSE
WHERE email = 'admin@example.com';

-- Email becomes optional (for future contact purposes, not authentication)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);

-- Add comment
COMMENT ON COLUMN users.student_id IS '学籍番号（ログイン用ID）';
COMMENT ON COLUMN users.email IS 'メールアドレス（オプショナル、連絡用）';
COMMENT ON COLUMN users.password_reset_required IS '初回ログイン時のパスワード変更フラグ';
