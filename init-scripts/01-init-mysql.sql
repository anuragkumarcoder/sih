-- MySQL Schema & Seed Data for NER Smart Logistics Platform (SIH26002)
CREATE DATABASE IF NOT EXISTS ner_logistics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ner_logistics_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(32) NOT NULL,
    assigned_state VARCHAR(32),
    assigned_vehicle_id VARCHAR(64),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. NER Districts Table
CREATE TABLE IF NOT EXISTS ner_districts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(10) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    headquarters_latitude DOUBLE NOT NULL,
    headquarters_longitude DOUBLE NOT NULL,
    average_elevation_meters DOUBLE NOT NULL,
    terrain_classification VARCHAR(50) NOT NULL,
    terrain_difficulty_rating INT NOT NULL,
    monsoon_vulnerability_index DOUBLE NOT NULL,
    is_border_district BOOLEAN NOT NULL DEFAULT FALSE,
    primary_access_highway VARCHAR(100)
);

-- 3. Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    district_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    elevation_meters DOUBLE NOT NULL,
    total_capacity_metric_tons DOUBLE NOT NULL,
    current_stock_metric_tons DOUBLE NOT NULL,
    cold_storage_capacity_tons DOUBLE NOT NULL,
    emergency_relief_stock_tons DOUBLE NOT NULL,
    is_helipad_available BOOLEAN NOT NULL DEFAULT FALSE,
    is_backup_power_available BOOLEAN NOT NULL DEFAULT TRUE,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wh_district FOREIGN KEY (district_id) REFERENCES ner_districts(id) ON DELETE RESTRICT
);

-- 4. Logistics Nodes Table
CREATE TABLE IF NOT EXISTS logistics_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    state_code VARCHAR(10) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    elevation_meters DOUBLE NOT NULL,
    daily_handling_capacity_tons INT NOT NULL,
    operational_status BOOLEAN NOT NULL DEFAULT TRUE,
    connectivity_notes VARCHAR(255)
);
