const { pool } = require('../../config/db');

class EventTypeService {
  async getAllEventTypes() {
    // Basic info for listing, include inactive ones so they can be managed. 
    // Also fetch the primary schedule_id for UI convenience.
    const query = `
      SELECT 
        et.id, et.title, et.slug, et.duration, et.host_name, et.location, et.is_active, et.accent_color,
        (SELECT schedule_id FROM schedule_event_types WHERE event_type_id = et.id LIMIT 1) as schedule_id
      FROM event_types et
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  async getEventTypeById(id) {
    const [rows] = await pool.query('SELECT * FROM event_types WHERE id = ?', [id]);
    const eventType = rows[0];
    
    if (eventType) {
        return this._enrichEventType(eventType);
    }
    return eventType;
  }

  async getEventTypeBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM event_types WHERE slug = ?', [slug]);
    const eventType = rows[0];
    
    if (eventType) {
        return this._enrichEventType(eventType);
    }
    return eventType;
  }

  async _enrichEventType(eventType) {
        // Fetch schedule_id from mapping table
        const [schedRows] = await pool.query('SELECT schedule_id FROM schedule_event_types WHERE event_type_id = ? LIMIT 1', [eventType.id]);
        if (schedRows.length > 0) {
            eventType.schedule_id = schedRows[0].schedule_id;
        }

        // Fetch availability based on schedule if present
        if (eventType.schedule_id) {
             const [slots] = await pool.query('SELECT day_of_week, start_time, end_time FROM availability_slots WHERE schedule_id = ?', [eventType.schedule_id]);
             eventType.availability = slots;
             
             const [overrides] = await pool.query('SELECT override_date, start_time, end_time FROM date_overrides WHERE schedule_id = ? AND override_date >= CURDATE()', [eventType.schedule_id]);
             eventType.overrides = overrides;
        } else {
             // If no schedule assigned, handle accordingly (empty or legacy logic)
             eventType.availability = [];
             eventType.overrides = [];
        }
        return eventType;
  }


  async createEventType(data) {
    const { 
        title, slug, duration, description, location, location_details, 
        host_name, host_email, timezone, buffer_before, buffer_after,
        accent_color, is_active, schedule_id
    } = data;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;
        while (true) {
            const [rows] = await connection.query('SELECT id FROM event_types WHERE slug = ?', [uniqueSlug]);
            if (rows.length === 0) break;
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const [result] = await connection.query(
          `INSERT INTO event_types (
            title, slug, duration, description, location, location_details, 
            host_name, host_email, timezone, buffer_before, buffer_after,
            accent_color, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title, uniqueSlug, duration, description, location, location_details, 
            host_name, host_email, timezone || 'UTC', buffer_before || 0, buffer_after || 0,
            accent_color || '#000000', is_active !== undefined ? is_active : true
          ]
        );
        const eventId = result.insertId;
        
        // Assign Schedule if provided
        if (schedule_id) {
            await connection.query('INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (?, ?)', [schedule_id, eventId]);
        }

        await connection.commit();
        return this.getEventTypeById(eventId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }

  async updateEventType(id, data) {
      const { schedule_id, ...otherFields } = data;
      const connection = await pool.getConnection();
      
      try {
          // Update basic fields
          const keys = Object.keys(otherFields);
          if (keys.length > 0) {
             // Filter out undefined
             const validKeys = keys.filter(k => otherFields[k] !== undefined);
             if (validKeys.length > 0) {
                 const setClause = validKeys.map(k => `${k} = ?`).join(', ');
                 const values = [...validKeys.map(k => otherFields[k]), id];
                 await connection.query(`UPDATE event_types SET ${setClause} WHERE id = ?`, values);
             }
          }

          // Update Schedule Assignment
          if (schedule_id !== undefined) {
             // Delete existing
             await connection.query('DELETE FROM schedule_event_types WHERE event_type_id = ?', [id]);
             // Insert new if not null
             if (schedule_id) {
                 await connection.query('INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (?, ?)', [schedule_id, id]);
             }
          }
          
          return this.getEventTypeById(id);
      } finally {
          connection.release();
      }
  }

  async deleteEventType(id) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE event_types SET is_active = FALSE WHERE id = ?', [id]);
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
