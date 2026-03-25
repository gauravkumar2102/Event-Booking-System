const pool = require('../config/db');
const { validationResult } = require('express-validator');

// POST /events/:id/attendance - Mark attendance using booking code
const markAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const { booking_code } = req.body;

  const eventId = parseInt(id);
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, error: 'Invalid event ID' });
  }

  try {
    // Find booking by code and event
    const [bookings] = await pool.query(
      `SELECT b.id AS booking_id, b.user_id, b.event_id, b.booking_code,
              u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.booking_code = ? AND b.event_id = ?`,
      [booking_code, eventId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid booking code for this event' });
    }

    const booking = bookings[0];

    // Check if already marked attendance
    const [existing] = await pool.query(
      'SELECT id FROM event_attendance WHERE booking_id = ?',
      [booking.booking_id]
    );

    if (existing.length > 0) {
      // Already attended — return how many tickets booked for this event
      const [ticketCount] = await pool.query(
        'SELECT COUNT(*) AS total_booked FROM bookings WHERE event_id = ?',
        [eventId]
      );
      return res.status(409).json({
        success: false,
        error: 'Attendance already marked for this booking code',
        data: {
          total_tickets_booked: ticketCount[0].total_booked
        }
      });
    }

    // Mark attendance
    await pool.query(
      'INSERT INTO event_attendance (booking_id, user_id, event_id, entry_time) VALUES (?, ?, ?, NOW())',
      [booking.booking_id, booking.user_id, eventId]
    );

    // Count total tickets booked for this event
    const [ticketCount] = await pool.query(
      'SELECT COUNT(*) AS total_booked FROM bookings WHERE event_id = ?',
      [eventId]
    );

    res.json({
      success: true,
      data: {
        message: 'Attendance marked successfully',
        user: { name: booking.user_name, email: booking.user_email },
        booking_code,
        total_tickets_booked: ticketCount[0].total_booked
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { markAttendance };
