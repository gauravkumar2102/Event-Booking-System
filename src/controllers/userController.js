const pool = require('../config/db');

// GET /users/:id/bookings - Get all bookings by a user
const getUserBookings = async (req, res) => {
  const { id } = req.params;

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const [user] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const [bookings] = await pool.query(
      `SELECT b.id AS booking_id, b.booking_code, b.booking_date,
              e.id AS event_id, e.title, e.description, e.date AS event_date,
              e.total_capacity, e.remaining_tickets
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: user[0],
        bookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getUserBookings };
