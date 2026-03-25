const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { markAttendance } = require('../controllers/attendanceController');

router.post(
  '/:id/attendance',
  [
    body('booking_code').trim().notEmpty().withMessage('booking_code is required')
  ],
  markAttendance
);

module.exports = router;
