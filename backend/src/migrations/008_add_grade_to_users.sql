-- Add grade column to users table
ALTER TABLE users ADD COLUMN grade INTEGER;

-- Add comment to the column
COMMENT ON COLUMN users.grade IS '学年 (1-4 for undergraduate, 5+ for graduate)';
