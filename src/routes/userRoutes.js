const express = require('express');
const router = express.Router();
const { getUserBookings } = require('../controllers/userController');

router.get('/:id/bookings', getUserBookings);

module.exports = router;
