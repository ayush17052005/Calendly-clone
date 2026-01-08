const { pool } = require('../../config/db');

class BookingService {
  async getBookings(filters = {}) {
      const { type, startDate, endDate } = filters;
      let query = `
        SELECT b.*, et.title as event_title, et.slug as event_slug, et.location, et.host_name
        FROM bookings b
        JOIN event_types et ON b.event_type_id = et.id
        WHERE 1=1 
      `;
      
      const params = [];

      if (type === 'upcoming') {
          query += ` AND b.start_time >= NOW()`;
      } else if (type === 'past') {
          query += ` AND b.start_time < NOW()`;
      } else if (type === 'range' && startDate && endDate) {
          query += ` AND b.start_time BETWEEN ? AND ?`;
          params.push(startDate, endDate);
      }

      query += ` ORDER BY b.start_time ${type === 'past' ? 'DESC' : 'ASC'}`;

      const [rows] = await pool.query(query, params);
      return rows;
  }

  async getBookingsForEventAndDateRange(eventTypeId, startDate, endDate) {
      const query = `
        SELECT start_time, end_time 
        FROM bookings 
        WHERE event_type_id = ? 
        AND status = 'confirmed'
        AND start_time < ? 
        AND end_time > ?
      `; 
      
      // We check for overlap: Booking Start < Range End AND Booking End > Range Start
      const [rows] = await pool.query(query, [eventTypeId, endDate, startDate]);
      return rows;
  }

  async getBookingById(id) {
      const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
      return rows[0];
  }

  async createBooking(data) {
    const { event_type_id, booker_name, booker_email, start_time, end_time } = data;
    
    // Check overlapping bookings
    const overlapQuery = `
        SELECT id FROM bookings
        WHERE event_type_id = ? 
        AND status = 'confirmed'
        AND start_time < ? 
        AND end_time > ?
    `;
    const [existing] = await pool.query(overlapQuery, [event_type_id, end_time, start_time]);
    
    if (existing.length > 0) {
        throw new Error('Slot already booked');
    }

    const [result] = await pool.query(
      'INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [event_type_id, booker_name, booker_email, start_time, end_time, 'confirmed']
    );
    return { id: result.insertId, ...data, status: 'confirmed' };
  }

  async updateBookingStatus(id, status, reason = null) {
      await pool.query(
        'UPDATE bookings SET status = ?, cancellation_reason = ? WHERE id = ?',
        [status, reason, id]
      );
      return { id, status, cancellation_reason: reason };
  }

  async deleteBooking(id) {
      const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
      return result.affectedRows > 0;
  }

  async rescheduleBooking(oldBookingId, newSlotData) {
      const connection = await pool.getConnection();
      try {
          await connection.beginTransaction();

          // 1. Cancel old booking
          await connection.query(
              'UPDATE bookings SET status = "rescheduled" WHERE id = ?', 
              [oldBookingId]
          );

          // 2. Create new booking
          const { event_type_id, booker_name, booker_email, start_time, end_time } = newSlotData;
          
          // Check overlapping for new slot (simple check within transaction)
          const [existing] = await connection.query(
            "SELECT id FROM bookings WHERE event_type_id = ? AND status = 'confirmed' AND start_time < ? AND end_time > ?",
            [event_type_id, end_time, start_time]
          );
           if (existing.length > 0) {
              throw new Error('New slot is already booked');
          }

          const [result] = await connection.query(
              'INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time, status, rescheduled_from_id) VALUES (?, ?, ?, ?, ?, "confirmed", ?)',
              [event_type_id, booker_name, booker_email, start_time, end_time, oldBookingId]
          );

          await connection.commit();
          return { id: result.insertId, ...newSlotData, status: 'confirmed' };
      } catch (error) {
          await connection.rollback();
          throw error;
      } finally {
          connection.release();
      }
  }
}

module.exports = new BookingService();
