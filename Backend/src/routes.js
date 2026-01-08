const express = require('express');
const eventTypeRoutes = require('./modules/eventTypes/eventTypes.routes');
const bookingRoutes = require('./modules/bookings/bookings.routes');

const router = express.Router();

router.use('/event-types', eventTypeRoutes);
router.use('/bookings', bookingRoutes);


module.exports = router;
