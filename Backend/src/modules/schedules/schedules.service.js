const { pool } = require('../../config/db');

class ScheduleService {
  async getAllSchedules() {
    // List all schedules.
    const [rows] = await pool.query('SELECT * FROM schedules ORDER BY is_default DESC, created_at ASC');
    return rows;
  }

  async getScheduleById(id) {
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);
    const schedule = rows[0];
    if (schedule) {
      // Fetch slots
      const [slots] = await pool.query(`
        SELECT day_of_week, start_time, end_time 
        FROM availability_slots 
        WHERE schedule_id = ? 
        ORDER BY 
          CASE 
            WHEN day_of_week = 'Monday' THEN 1
            WHEN day_of_week = 'Tuesday' THEN 2
            WHEN day_of_week = 'Wednesday' THEN 3
            WHEN day_of_week = 'Thursday' THEN 4
            WHEN day_of_week = 'Friday' THEN 5
            WHEN day_of_week = 'Saturday' THEN 6
            WHEN day_of_week = 'Sunday' THEN 7
          END, 
          start_time
      `, [id]);
      schedule.availability = slots;
      
      // Fetch active overrides (future)
      const [overrides] = await pool.query('SELECT override_date, start_time, end_time FROM date_overrides WHERE schedule_id = ? AND override_date >= CURDATE() ORDER BY override_date, start_time', [id]);
      schedule.overrides = overrides;

      // Fetch assigned event types
      const [events] = await pool.query(`
        SELECT et.id, et.title, et.slug, et.is_active, et.accent_color 
        FROM event_types et
        JOIN schedule_event_types set_map ON et.id = set_map.event_type_id
        WHERE set_map.schedule_id = ?
      `, [id]);
      schedule.eventTypes = events;
    }
    return schedule;
  }

  async createSchedule(data) {
    const { name, timezone, is_default } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.query(
        'INSERT INTO schedules (name, timezone, is_default) VALUES (?, ?, ?)',
        [name, timezone || 'UTC', is_default || 0]
      );
      const scheduleId = result.insertId;
      
      // Insert default M-F 9-5 slots for new schedule
      const defaultSlots = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => [scheduleId, day, '09:00:00', '17:00:00']);
      await connection.query(
          'INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time) VALUES ?',
          [defaultSlots]
      );

      await connection.commit();
      return this.getScheduleById(scheduleId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateSchedule(id, data) {
    const { name, timezone, is_default } = data;
    const connection = await pool.getConnection();
    try {
      // If setting as default, unset others? Not strictly requested but good practice.
      // For now simple update.
      const fields = [];
      const values = [];
      if (name) { fields.push('name = ?'); values.push(name); }
      if (timezone) { fields.push('timezone = ?'); values.push(timezone); }
      if (is_default !== undefined) { fields.push('is_default = ?'); values.push(is_default); }

      if (fields.length > 0) {
          values.push(id);
          await connection.query(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, values);
      }
      return this.getScheduleById(id);
    } finally {
        connection.release();
    }
  }

  async updateSlots(id, slots, timezone) {
    // Reusing logic but slightly adapted
    return this.updateWeeklySlots(id, slots, timezone);
  }

  // Helper for internal use or backward compat
    async getDefaultSchedule() {
        // For this assignment, we assume the first schedule marked is_default is THE schedule.
        const [rows] = await pool.query('SELECT * FROM schedules WHERE is_default = TRUE LIMIT 1');
        if (rows.length === 0) return null;
        return this.getScheduleById(rows[0].id);
    }

    async updateWeeklySlots(scheduleId, slots, timezone) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Update Timezone if provided
            if (timezone) {
                await connection.query('UPDATE schedules SET timezone = ? WHERE id = ?', [timezone, scheduleId]);
            }

            // Clear existing slots for this schedule
            await connection.query('DELETE FROM availability_slots WHERE schedule_id = ?', [scheduleId]);

            // Insert new slots
            if (slots && slots.length > 0) {
            // slots: { day: 'Monday', start: '09:00', end: '17:00' }
                const values = slots.map(slot => [scheduleId, slot.day, slot.start, slot.end]);
                await connection.query(
                    'INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return this.getScheduleById(scheduleId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async setDateOverride(scheduleId, date, slots) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Clear existing overrides for this date
            await connection.query('DELETE FROM date_overrides WHERE schedule_id = ? AND override_date = ?', [scheduleId, date]);

            // Insert new overrides
            if (slots && slots.length > 0) {
                const values = slots.map(slot => [scheduleId, date, slot.start, slot.end]);
                await connection.query(
                    'INSERT INTO date_overrides (schedule_id, override_date, start_time, end_time) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            
            // Return updated overrides
            const [overrides] = await connection.query('SELECT override_date, start_time, end_time FROM date_overrides WHERE schedule_id = ? AND override_date >= CURDATE() ORDER BY override_date', [scheduleId]);
            return overrides;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
  
  async toggleEventTypeAssignment(scheduleId, eventTypeId, assign) {
    if (assign) {
        // Insert into junction table if not exists. 
        // Note: Schema might not have UNIQUE constraint on (schedule_id, event_type_id), so we use SELECT or IGNORE if defined.
        // Or blindly delete then insert. Safest is DELETE then INSERT or checking first.
        // Assuming we want fresh assignment.
        const [exists] = await pool.query('SELECT 1 FROM schedule_event_types WHERE schedule_id = ? AND event_type_id = ?', [scheduleId, eventTypeId]);
        if (exists.length === 0) {
            await pool.query('INSERT INTO schedule_event_types (schedule_id, event_type_id) VALUES (?, ?)', [scheduleId, eventTypeId]);
        }
    } else {
        await pool.query('DELETE FROM schedule_event_types WHERE schedule_id = ? AND event_type_id = ?', [scheduleId, eventTypeId]);
    }
    return true;
  }
  
  async deleteSchedule(id) {
    const [rows] = await pool.query('SELECT is_default FROM schedules WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].is_default) {
        throw new Error("Cannot delete default schedule");
    }
    // Remove associations in junction table
    await pool.query('DELETE FROM schedule_event_types WHERE schedule_id = ?', [id]);
    
    // Delete schedule (CASCADE handles slots/overrides)
    await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new ScheduleService();
