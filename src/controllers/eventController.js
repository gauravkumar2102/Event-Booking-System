const pool = require('../config/db');
const { validationResult } = require('express-validator');

// GET /events - List all upcoming events
const getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, date, total_capacity, remaining_tickets
       FROM events
       WHERE date >= NOW()
       ORDER BY date ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /events - Create a new event
const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { title, description, date, total_capacity } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, date, total_capacity, total_capacity]
    );
    const [event] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: event[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAllEvents, createEvent };
