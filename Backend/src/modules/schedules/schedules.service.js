const { pool } = require('../../config/db');

class ScheduleService {
    async getDefaultSchedule() {
        // For this assignment, we assume the first schedule marked is_default is THE schedule.
        const [rows] = await pool.query('SELECT * FROM schedules WHERE is_default = TRUE LIMIT 1');
        if (rows.length === 0) return null;
        
        const schedule = rows[0];
        
        // Fetch slots
        const [slots] = await pool.query('SELECT day_of_week, start_time, end_time FROM availability_slots WHERE schedule_id = ? ORDER BY FIELD(day_of_week, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), start_time', [schedule.id]);
        
        // Fetch active overrides (future)
        const [overrides] = await pool.query('SELECT override_date, start_time, end_time FROM date_overrides WHERE schedule_id = ? AND override_date >= CURDATE() ORDER BY override_date, start_time', [schedule.id]);

        return {
            ...schedule,
            slots,
            overrides
        };
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
                const values = slots.map(slot => [scheduleId, slot.day, slot.start, slot.end]);
                // slot.day should be full name 'Monday', etc.
                await connection.query(
                    'INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return this.getDefaultSchedule();
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
}

module.exports = new ScheduleService();
