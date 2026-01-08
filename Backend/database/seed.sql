-- Seed Data

INSERT INTO event_types (title, slug, description, duration, location, host_name, host_email, buffer_before, buffer_after) 
VALUES ('15 Min Quick Chat', '15-min-chat', 'A short catch-up call.', 15, 'meet', 'Ayush', 'ayush@example.com', 5, 5);

SET @event_id_1 = LAST_INSERT_ID();

INSERT INTO availability_slots (event_type_id, day_of_week, start_time, end_time) VALUES
(@event_id_1, 'Monday', '09:00:00', '17:00:00'),
(@event_id_1, 'Tuesday', '09:00:00', '17:00:00'),
(@event_id_1, 'Wednesday', '09:00:00', '17:00:00'),
(@event_id_1, 'Thursday', '09:00:00', '17:00:00'),
(@event_id_1, 'Friday', '09:00:00', '17:00:00');

INSERT INTO event_types (title, slug, description, duration, location, host_name, host_email, buffer_before, buffer_after) 
VALUES ('1 Hour Interview', '1-hour-interview', 'Technical interview session.', 60, 'zoom', 'Hiring Manager', 'hiring@example.com', 10, 10);

SET @event_id_2 = LAST_INSERT_ID();

INSERT INTO availability_slots (event_type_id, day_of_week, start_time, end_time) VALUES
(@event_id_2, 'Tuesday', '10:00:00', '16:00:00'),
(@event_id_2, 'Thursday', '10:00:00', '16:00:00');

INSERT INTO date_overrides (event_type_id, override_date, start_time, end_time) 
VALUES (@event_id_1, '2025-12-25', '00:00:00', '00:00:00');
