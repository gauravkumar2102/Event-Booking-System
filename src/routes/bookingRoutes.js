const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createBooking } = require('../controllers/bookingController');

router.post(
  '/',
  [
    body('user_id').isInt({ min: 1 }).withMessage('user_id must be a positive integer'),
    body('event_id').isInt({ min: 1 }).withMessage('event_id must be a positive integer')
  ],
  createBooking
);

module.exports = router;
