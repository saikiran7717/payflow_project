-- Database Migration Script for Manager-Employee Mapping and CTC Updates
-- Run this script in your MySQL database if automatic schema update fails

USE payflow_test2;

-- Remove is_active column from CTC table (recent change)
-- Check if column exists first
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'ctc_details' 
     AND column_name = 'is_active' 
     AND table_schema = DATABASE()) > 0,
    'ALTER TABLE ctc_details DROP COLUMN is_active',
    'SELECT "Column is_active does not exist in ctc_details"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remove was_active column from CTC history table (recent change)  
-- Check if column exists first
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'ctc_history' 
     AND column_name = 'was_active' 
     AND table_schema = DATABASE()) > 0,
    'ALTER TABLE ctc_history DROP COLUMN was_active',
    'SELECT "Column was_active does not exist in ctc_history"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update ctc_history table structure to reference CTC entity instead of original_ctc_id
-- Drop original_ctc_id column if it exists
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'ctc_history' 
     AND column_name = 'original_ctc_id' 
     AND table_schema = DATABASE()) > 0,
    'ALTER TABLE ctc_history DROP COLUMN original_ctc_id',
    'SELECT "Column original_ctc_id does not exist in ctc_history"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add ctc_id column as foreign key to CTC table
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'ctc_history' 
     AND column_name = 'ctc_id' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE ctc_history ADD COLUMN ctc_id BIGINT NOT NULL',
    'SELECT "Column ctc_id already exists in ctc_history"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for ctc_id if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_name = 'ctc_history' 
     AND column_name = 'ctc_id' 
     AND referenced_table_name = 'ctc_details'
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE ctc_history ADD CONSTRAINT FK_ctc_history_ctc FOREIGN KEY (ctc_id) REFERENCES ctc_details(ctc_id)',
    'SELECT "Foreign key constraint FK_ctc_history_ctc already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
DESCRIBE ctc_details;
DESCRIBE ctc_history;
