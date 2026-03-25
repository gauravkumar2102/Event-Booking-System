-- ============================================================
-- Event Booking System - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  total_capacity INT NOT NULL CHECK (total_capacity > 0),
  remaining_tickets INT NOT NULL CHECK (remaining_tickets >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_remaining CHECK (remaining_tickets <= total_capacity)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  booking_code VARCHAR(12) NOT NULL UNIQUE,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_event UNIQUE (user_id, event_id)
);

-- Event Attendance Table
CREATE TABLE IF NOT EXISTS event_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================================
-- Sample seed data (optional, for testing)
-- ============================================================
INSERT INTO users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith', 'bob@example.com'),
  ('Charlie Brown', 'charlie@example.com');

INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
  ('Tech Conference 2025', 'Annual technology conference covering AI, Web3 and more.', '2025-12-15 09:00:00', 200, 200),
  ('Music Night', 'Live music performance with local bands.', '2025-11-20 19:00:00', 100, 100),
  ('Startup Meetup', 'Networking event for startup founders and investors.', '2025-10-05 18:00:00', 50, 50);
