DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS date_overrides;
DROP TABLE IF EXISTS availability_slots;
DROP TABLE IF EXISTS event_types;

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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE availability_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
);

CREATE TABLE date_overrides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT NOT NULL,
  override_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
  UNIQUE(event_type_id, override_date, start_time, end_time)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT NOT NULL,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('confirmed', 'cancelled', 'rescheduled') DEFAULT 'confirmed',
  cancellation_reason TEXT,
  rescheduled_from_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
  FOREIGN KEY (rescheduled_from_id) REFERENCES bookings(id) ON DELETE SET NULL
);
