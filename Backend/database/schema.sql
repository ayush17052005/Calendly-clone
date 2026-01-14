SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS date_overrides;
DROP TABLE IF EXISTS availability_slots;
DROP TABLE IF EXISTS schedule_event_types;
DROP TABLE IF EXISTS event_types;
DROP TABLE IF EXISTS schedules;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Working Hours',
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  duration INT NOT NULL, 
  location VARCHAR(50) DEFAULT 'meet',
  location_details TEXT,
  host_name VARCHAR(255) NOT NULL,
  host_email VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  buffer_before INT DEFAULT 0,
  buffer_after INT DEFAULT 0,
  accent_color VARCHAR(50) DEFAULT '#000000',
  is_active BOOLEAN DEFAULT TRUE,
  booking_type ENUM('one_on_one', 'group') DEFAULT 'one_on_one',
  capacity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule_event_types (
  schedule_id INT NOT NULL,
  event_type_id INT NOT NULL,
  PRIMARY KEY (schedule_id, event_type_id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
);

CREATE TABLE availability_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT,
  schedule_id INT,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  CHECK (event_type_id IS NOT NULL OR schedule_id IS NOT NULL)
);

CREATE TABLE date_overrides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT,
  schedule_id INT,
  override_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  CHECK (event_type_id IS NOT NULL OR schedule_id IS NOT NULL)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT NOT NULL,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
);
