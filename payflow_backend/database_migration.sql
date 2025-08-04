-- Database Migration Script for Manager-Employee Mapping
-- Run this script in your MySQL database if automatic schema update fails

USE payflow_test2;

-- Add manager_id column to employee table if it doesn't exist
ALTER TABLE employee 
ADD COLUMN IF NOT EXISTS manager_id BIGINT NULL;

-- Add foreign key constraint
ALTER TABLE employee 
ADD CONSTRAINT IF NOT EXISTS FK_employee_manager 
FOREIGN KEY (manager_id) REFERENCES user(user_id);

-- Optional: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_employee_manager_id ON employee(manager_id);

-- Verify the changes
DESCRIBE employee;
