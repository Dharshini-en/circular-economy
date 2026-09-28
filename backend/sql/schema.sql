CREATE DATABASE IF NOT EXISTS plm_predictive_service;
USE plm_predictive_service;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30) UNIQUE NOT NULL,
    product_name VARCHAR(160) NOT NULL,
    product_category VARCHAR(80),
    manufacturer VARCHAR(120),
    manufacture_date DATE,
    expected_life_hours INT,
    service_interval_hours INT,
    cad_file VARCHAR(255),
    bom_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Usage_Data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30) NOT NULL,
    product_age_months INT,
    operating_hours INT,
    operating_cycles INT,
    average_load INT,
    average_temperature INT,
    lubrication_interval INT,
    last_service_hours INT,
    number_of_services INT,
    oil_condition VARCHAR(80),
    bearing_condition VARCHAR(80),
    vibration_level DECIMAL(5,2),
    health_score DECIMAL(5,2),
    remaining_useful_life INT,
    service_required VARCHAR(10),
    next_service_days INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Maintenance_History (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30) NOT NULL,
    maintenance_date DATE,
    service_type VARCHAR(120),
    notes TEXT,
    status VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30) NOT NULL,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    health_score DECIMAL(5,2),
    remaining_useful_life_hours INT,
    remaining_useful_life_days DECIMAL(6,2),
    next_service_date DATE,
    maintenance_priority VARCHAR(40),
    priority_color VARCHAR(20),
    ai_recommendation VARCHAR(120),
    hours_since_last_service INT,
    average_daily_usage DECIMAL(6,2),
    maintenance_frequency_per_year DECIMAL(6,2),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CAD_Files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30) NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS BOM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30) NOT NULL,
    bom_name VARCHAR(255),
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(30),
    alert_type VARCHAR(120),
    message TEXT,
    severity VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(160),
    report_type VARCHAR(80),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload TEXT
);
