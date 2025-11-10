-- Add registration_number column to users table
ALTER TABLE users ADD COLUMN registration_number VARCHAR(20);

COMMENT ON COLUMN users.registration_number IS 'Registration number (登録番号) - 8 digit number from CSV';
