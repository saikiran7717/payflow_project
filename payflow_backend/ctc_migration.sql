-- CTC Details Table Migration
-- Run this SQL to add the CTC details table to your database

CREATE TABLE IF NOT EXISTS ctc_details (
    ctc_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    effective_from DATE NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) DEFAULT 0.00,
    allowances DECIMAL(12,2) DEFAULT 0.00,
    bonuses DECIMAL(12,2) DEFAULT 0.00,
    pf_contribution DECIMAL(12,2) DEFAULT 0.00,
    gratuity DECIMAL(12,2) DEFAULT 0.00,
    total_ctc DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_ctc_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_ctc_employee_id (employee_id),
    INDEX idx_ctc_effective_from (effective_from),
    INDEX idx_ctc_is_active (is_active),
    INDEX idx_ctc_total_ctc (total_ctc),
    
    -- Composite indexes
    INDEX idx_ctc_employee_active (employee_id, is_active),
    INDEX idx_ctc_employee_effective (employee_id, effective_from),
    
    -- Ensure effective_from is not in the past for new records (optional constraint)
    -- CONSTRAINT chk_effective_from_future CHECK (effective_from >= CURDATE())
    
    -- Ensure basic salary is positive
    CONSTRAINT chk_basic_salary_positive CHECK (basic_salary > 0),
    
    -- Ensure total CTC is positive
    CONSTRAINT chk_total_ctc_positive CHECK (total_ctc > 0)
);

-- Insert sample CTC data (optional - for testing)
-- You can remove this section if you don't want sample data

-- Sample CTC records for existing employees (adjust employee_id based on your data)
INSERT INTO ctc_details (employee_id, effective_from, basic_salary, hra, allowances, bonuses, pf_contribution, gratuity, total_ctc, is_active)
VALUES 
    -- Example for employee ID 1
    (1, '2024-01-01', 600000.00, 120000.00, 50000.00, 100000.00, 72000.00, 29000.00, 971000.00, TRUE),
    
    -- Example for employee ID 2  
    (2, '2024-01-01', 800000.00, 160000.00, 75000.00, 150000.00, 96000.00, 38000.00, 1319000.00, TRUE),
    
    -- Example for employee ID 3
    (3, '2024-01-01', 450000.00, 90000.00, 30000.00, 50000.00, 54000.00, 22000.00, 696000.00, TRUE);

-- Note: Adjust the employee_id values based on the actual employee IDs in your employee table
-- You can check existing employee IDs with: SELECT employee_id, full_name FROM employee;

-- Query to verify the table was created successfully
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ctc_details'
-- ORDER BY ORDINAL_POSITION;
