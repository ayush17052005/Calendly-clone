const { pool } = require('../../config/db');

class EventTypeService {
  async getAllEventTypes() {
    // Basic info for listing
    const [rows] = await pool.query('SELECT id, title, slug, duration, host_name, location, is_active FROM event_types WHERE is_active = TRUE');
    return rows;
  }

  async getEventTypeById(id) {
    const [rows] = await pool.query('SELECT * FROM event_types WHERE id = ?', [id]);
    const eventType = rows[0];
    if (eventType) {
        // Fetch availability slots
        const [slots] = await pool.query('SELECT day_of_week, start_time, end_time FROM availability_slots WHERE event_type_id = ?', [id]);
        eventType.availability = slots;
        
        // Fetch overrides (listing future ones only mostly)
        const [overrides] = await pool.query('SELECT override_date, start_time, end_time FROM date_overrides WHERE event_type_id = ? AND override_date >= CURDATE()', [id]);
        eventType.overrides = overrides;
    }
    return eventType;
  }

  async createEventType(data) {
    const { 
        title, slug, duration, description, location, location_details, 
        host_name, host_email, timezone, buffer_before, buffer_after, availability 
    } = data;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
          `INSERT INTO event_types (
            title, slug, duration, description, location, location_details, 
            host_name, host_email, timezone, buffer_before, buffer_after
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title, slug, duration, description, location, location_details, 
            host_name, host_email, timezone || 'UTC', buffer_before || 0, buffer_after || 0
          ]
        );
        const eventId = result.insertId;

        // Insert availability slots if provided
        if (availability && Array.isArray(availability) && availability.length > 0) {
            const values = availability.map(slot => [eventId, slot.day_of_week, slot.start_time, slot.end_time]);
            await connection.query(
                'INSERT INTO availability_slots (event_type_id, day_of_week, start_time, end_time) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        return { id: eventId, ...data };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }

  async updateEventType(id, data) {
    const { 
        title, slug, duration, description, location, location_details, 
        host_name, host_email, timezone, buffer_before, buffer_after, availability 
    } = data;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Build dynamic update query
        const fields = [];
        const values = [];

        if (title) { fields.push('title = ?'); values.push(title); }
        if (slug) { fields.push('slug = ?'); values.push(slug); }
        if (duration) { fields.push('duration = ?'); values.push(duration); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (location) { fields.push('location = ?'); values.push(location); }
        if (location_details !== undefined) { fields.push('location_details = ?'); values.push(location_details); }
        if (host_name) { fields.push('host_name = ?'); values.push(host_name); }
        if (host_email) { fields.push('host_email = ?'); values.push(host_email); }
        if (timezone) { fields.push('timezone = ?'); values.push(timezone); }
        if (buffer_before !== undefined) { fields.push('buffer_before = ?'); values.push(buffer_before); }
        if (buffer_after !== undefined) { fields.push('buffer_after = ?'); values.push(buffer_after); }

        if (fields.length > 0) {
            values.push(id);
            await connection.query(`UPDATE event_types SET ${fields.join(', ')} WHERE id = ?`, values);
        }

        // Update availability if provided
        if (availability && Array.isArray(availability)) {
            // Delete existing slots
            await connection.query('DELETE FROM availability_slots WHERE event_type_id = ?', [id]);

            // Insert new slots if any
            if (availability.length > 0) {
                const slotValues = availability.map(slot => [id, slot.day_of_week, slot.start_time, slot.end_time]);
                await connection.query(
                    'INSERT INTO availability_slots (event_type_id, day_of_week, start_time, end_time) VALUES ?',
                    [slotValues]
                );
            }
        }

        await connection.commit();
        
        // Return updated object
        return this.getEventTypeById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }

  async deleteEventType(id) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Soft delete or hard delete? Usually soft delete is better for history, 
        // but requirements didn't specify. The listing query checks is_active=TRUE.
        // Let's do soft delete.
        await connection.query('UPDATE event_types SET is_active = FALSE WHERE id = ?', [id]);
        
        // Alternatively, if hard delete is preferred:
        // await connection.query('DELETE FROM availability_slots WHERE event_type_id = ?', [id]);
        // await connection.query('DELETE FROM date_overrides WHERE event_type_id = ?', [id]);
        // await connection.query('DELETE FROM event_types WHERE id = ?', [id]);
        
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }
}

module.exports = new EventTypeService();
