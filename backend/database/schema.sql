-- File Tracking & Management System Database Schema

-- Create files table (main file status)
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(50) UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Created', 'Moving', 'Received', 'Closed') DEFAULT 'Created',
    updated_by VARCHAR(100),
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    moved_to VARCHAR(255) NULL,
    received_at VARCHAR(255) NULL,
    INDEX idx_file_id (file_id),
    INDEX idx_status (status)
);

-- Create file_log table (action history)
CREATE TABLE IF NOT EXISTS file_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(50) NOT NULL,
    status ENUM('Created', 'Moving', 'Received', 'Closed') NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    moved_to VARCHAR(255) NULL,
    received_at VARCHAR(255) NULL,
    action_details TEXT NULL,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    INDEX idx_file_id (file_id),
    INDEX idx_status (status),
    INDEX idx_update_time (update_time)
);

-- Insert sample data for testing
INSERT INTO files (file_id, file_name, created_by, created_time, status, updated_by, updated_time, moved_to, received_at) VALUES
('F-2024', 'Transformer Repair Log', 'Mr. Dutta', '2024-07-01 10:00:00', 'Received', '3', '2025-07-19 17:36:43', 'Dispur Office', 'Dispur Office'),
('F-2025', 'Audit Report Q2', 'Mrs. Lata Roy', '2024-07-02 09:30:00', 'Created', '2', '2024-07-02 09:30:00', NULL, NULL),
('F-2026', 'Substation Upgrade Plan', 'Mr. Hazarika', '2024-07-03 14:15:00', 'Created', '3', '2024-07-03 14:15:00', NULL, NULL);

INSERT INTO file_log (file_id, status, updated_by, update_time, moved_to, received_at) VALUES
('F-2024', 'Created', '1', '2024-07-01 10:00:00', NULL, NULL),
('F-2025', 'Created', '2', '2024-07-02 09:30:00', NULL, NULL),
('F-2026', 'Created', '3', '2024-07-03 14:15:00', NULL, NULL),
('F-2024', 'Moving', '1', '2025-07-19 17:34:56', 'Bijulee Bhawan', NULL),
('F-2024', 'Received', '5', '2025-07-19 17:37:16', NULL, 'SCADA Cell');
