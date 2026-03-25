const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// POST /bookings - Book a ticket for a user
const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { user_id, event_id } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the event row to prevent race conditions
    const [events] = await connection.query(
      'SELECT * FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const event = events[0];

    if (event.remaining_tickets <= 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, error: 'No tickets available for this event' });
    }

    // Check event is in the future
    if (new Date(event.date) < new Date()) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Cannot book tickets for past events' });
    }

    // Check user exists
    const [users] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check duplicate booking
    const [existing] = await connection.query(
      'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
      [user_id, event_id]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, error: 'User has already booked this event' });
    }

    // Generate unique booking code
    const booking_code = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();

    // Create booking
    const [result] = await connection.query(
      `INSERT INTO bookings (user_id, event_id, booking_date, booking_code)
       VALUES (?, ?, NOW(), ?)`,
      [user_id, event_id, booking_code]
    );

    // Decrement remaining tickets
    await connection.query(
      'UPDATE events SET remaining_tickets = remaining_tickets - 1 WHERE id = ?',
      [event_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      data: {
        booking_id: result.insertId,
        user_id,
        event_id,
        booking_code,
        message: 'Booking confirmed! Use your booking code for entry.'
      }
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
};

module.exports = { createBooking };
