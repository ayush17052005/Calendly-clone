const { pool } = require('../../config/db');

class BookingService {
  async getBookings(filters = {}) {
      const { type, startDate, endDate } = filters;
      let query = `
        SELECT b.id as booking_id, b.booker_name, b.booker_email, b.status, b.start_time, b.end_time, b.created_at, b.cancellation_reason,
               et.id as event_type_id, et.title as event_title, et.slug as event_slug, et.location, et.host_name, et.duration, et.booking_type, et.capacity
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
      
      // Grouping logic for "Group Bookings"
      // Even "One-on-One" will be structure as a meeting with 1 invitee for consistency
      const meetingsMap = new Map();

      for (const row of rows) {
          const key = `${row.event_type_id}-${new Date(row.start_time).toISOString()}`;
          
          if (!meetingsMap.has(key)) {
              meetingsMap.set(key, {
                  id: key, // Synthetic ID for frontend keys
                  event_type_id: row.event_type_id,
                  event_title: row.event_title,
                  event_slug: row.event_slug,
                  location: row.location,
                  host_name: row.host_name,
                  duration: row.duration,
                  start_time: row.start_time,
                  end_time: row.end_time,
                  booking_type: row.booking_type,
                  capacity: row.capacity,
                  invitees: [] 
              });
          }
          
          const meeting = meetingsMap.get(key);
          meeting.invitees.push({
              id: row.booking_id,
              name: row.booker_name,
              email: row.booker_email,
              status: row.status,
              cancellation_reason: row.cancellation_reason,
              created_at: row.created_at
          });
      }

      return Array.from(meetingsMap.values());
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
    
    // 1. Fetch Event Type Config
    const [etRows] = await pool.query('SELECT booking_type, capacity FROM event_types WHERE id = ?', [event_type_id]);
    if (etRows.length === 0) throw new Error('Event Type not found');
    const { booking_type, capacity } = etRows[0];

    // 2. Check overlaps
    const overlapQuery = `
        SELECT COUNT(*) as count FROM bookings
        WHERE event_type_id = ? 
        AND status = 'confirmed'
        AND start_time < ? 
        AND end_time > ?
    `;
    const [existing] = await pool.query(overlapQuery, [event_type_id, end_time, start_time]);
    const bookedCount = existing[0].count;
    
    // 3. Enforce Capacity
    if (booking_type === 'group') {
        const maxCapacity = capacity || 1;
        if (bookedCount >= maxCapacity) {
             throw new Error('Slot is fully booked');
        }
    } else {
        // One-on-one (default)
        if (bookedCount > 0) {
            throw new Error('Slot already booked');
        }
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

 
}

module.exports = new BookingService();
