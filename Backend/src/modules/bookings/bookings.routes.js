const express = require('express');
const bookingController = require('./bookings.controller');

const router = express.Router();

router.route('/')
    .get(bookingController.getBookings)
    .post(bookingController.createBooking);

router.route('/:id')
    .get(bookingController.getBooking)
    .delete(bookingController.deleteBooking);

router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
