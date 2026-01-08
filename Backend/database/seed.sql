-- Seed Data Generated from DB

-- Schedules
INSERT INTO schedules (id, name, timezone, is_default, created_at) VALUES (2, 'Office hours ', 'UTC', 0, '2026-01-08 08:23:39');
INSERT INTO schedules (id, name, timezone, is_default, created_at) VALUES (3, 'Working Hours', 'Asia/Kolkata', 1, '2026-01-08 08:31:02');

-- Event Types
INSERT INTO event_types (id, title, slug, description, duration, location, location_details, host_name, host_email, timezone, buffer_before, buffer_after, accent_color, is_active, created_at) VALUES (1, 'Meeting 1', 'meeting-1', 'Meeting with Ayush Saha', 30, 'In-person', NULL, 'Ayush Saha', 'ayush@example.com', 'Asia/Calcutta', 0, 0, '#06B6D4', 1, '2026-01-08 08:25:18');
INSERT INTO event_types (id, title, slug, description, duration, location, location_details, host_name, host_email, timezone, buffer_before, buffer_after, accent_color, is_active, created_at) VALUES (5, 'Meeting 2', 'meeting-2', 'Meeting with Ayush Saha', 45, 'Zoom', NULL, 'Ayush Saha', 'ayush@example.com', 'Asia/Calcutta', 0, 0, '#8b5cf6', 1, '2026-01-08 08:30:01');
INSERT INTO event_types (id, title, slug, description, duration, location, location_details, host_name, host_email, timezone, buffer_before, buffer_after, accent_color, is_active, created_at) VALUES (6, '15 Min Quick Chat', '15-min-chat', 'Meeting with Ayush', 15, 'meet', NULL, 'Ayush', 'ayush@example.com', 'Asia/Calcutta', 5, 5, '#EC4899', 1, '2026-01-08 08:31:02');
INSERT INTO event_types (id, title, slug, description, duration, location, location_details, host_name, host_email, timezone, buffer_before, buffer_after, accent_color, is_active, created_at) VALUES (7, '1 Hour Interview', '1-hour-interview', 'Meeting with Hiring Manager', 60, 'zoom', NULL, 'Hiring Manager', 'ayush@example.com', 'Asia/Calcutta', 10, 10, '#000000', 1, '2026-01-08 08:31:02');
INSERT INTO event_types (id, title, slug, description, duration, location, location_details, host_name, host_email, timezone, buffer_before, buffer_after, accent_color, is_active, created_at) VALUES (8, 'Meeting 3', 'new-meeting', 'Meeting with Ayush Saha', 30, 'In-person', NULL, 'Ayush Saha', 'ayush@example.com', 'Asia/Calcutta', 0, 0, '#10B981', 1, '2026-01-08 08:33:31');

-- Schedule Event Types
INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (2, 1);
INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (2, 5);
INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (2, 6);
INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (2, 7);
INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (2, 8);

-- Availability Slots
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 2, 'Monday', '11:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 2, 'Tuesday', '11:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 2, 'Wednesday', '11:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 2, 'Thursday', '11:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 2, 'Friday', '11:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (6, NULL, 'Monday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (6, NULL, 'Tuesday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (6, NULL, 'Wednesday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (6, NULL, 'Thursday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (6, NULL, 'Friday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (7, NULL, 'Tuesday', '10:00:00', '16:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (7, NULL, 'Thursday', '10:00:00', '16:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 3, 'Monday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 3, 'Tuesday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 3, 'Wednesday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 3, 'Thursday', '09:00:00', '17:00:00');
INSERT INTO availability_slots (event_type_id, schedule_id, day_of_week, start_time, end_time) VALUES (NULL, 3, 'Friday', '09:00:00', '17:00:00');

-- Date Overrides
INSERT INTO date_overrides (event_type_id, schedule_id, override_date, start_time, end_time) VALUES (6, NULL, '2025-12-24', '00:00:00', '00:00:00');
INSERT INTO date_overrides (event_type_id, schedule_id, override_date, start_time, end_time) VALUES (NULL, 2, '2026-01-08', '16:00:00', '17:00:00');

-- Bookings
INSERT INTO bookings (id, event_type_id, booker_name, booker_email, start_time, end_time, status, cancellation_reason, rescheduled_from_id, created_at) VALUES (8, 7, 'invite 3', 'invite@gmail.com', '2026-01-13 07:30:00', '2026-01-13 08:30:00', 'confirmed', NULL, NULL, '2026-01-08 10:51:03');

