const express = require('express');
const bookingController = require('./bookings.controller');

const router = express.Router();

router.route('/')
    .get(bookingController.getBookings)
    .post(bookingController.createBooking);

router.route('/:id')
    .get(bookingController.getBooking);

router.post('/:id/cancel', bookingController.cancelBooking);
router.post('/:id/reschedule', bookingController.rescheduleBooking);

module.exports = router;
