const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllEvents, createEvent } = require('../controllers/eventController');

router.get('/', getAllEvents);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('total_capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('description').optional().isString()
  ],
  createEvent
);

module.exports = router;
