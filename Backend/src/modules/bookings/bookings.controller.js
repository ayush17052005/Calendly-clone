const bookingService = require('./bookings.service');
const eventTypeService = require('../eventTypes/eventTypes.service');
const asyncHandler = require('../../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

exports.getBookings = asyncHandler(async (req, res) => {
    const filters = req.query;
    const bookings = await bookingService.getBookings(filters);
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: { bookings }
    });
});

exports.getBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) {
        throw new NotFoundError('Booking not found');
    }
    res.status(200).json({
        status: 'success',
        data: { booking }
    });
});

exports.createBooking = asyncHandler(async (req, res) => {
    const { event_type_id, start_time } = req.body;
    
    // 1. Fetch Event Type Details to calculate end_time
    const eventType = await eventTypeService.getEventTypeById(event_type_id);
    if (!eventType) {
        throw new NotFoundError('Event Type not found');
    }

    // Treat the incoming string as UTC to preserve face value (avoid local timezone shift)
    // Ensures "2026-01-09 09:30:00" stays "2026-01-09 09:30:00" in DB
    const timeStr = start_time.includes('T') ? start_time : start_time.replace(' ', 'T');
    // If user sends local time string 'YYYY-MM-DD HH:mm:ss' but we want to treat it as a UTC point in time:
    // We append Z. 
    // BUT if the frontend sends "2026-01-20 14:00:00" (Local), appending Z makes it 14:00 UTC.
    // If user meant 14:00 Local (IST), that is 08:30 UTC.
    // However, the issue is likely that we want to store *exactly what the user sent*?
    // No, standard is usually UTC.
    // If frontend sends '2026-01-20 14:00:00' (implied local), and we treat it as UTC, we shift it by timezone offset twice if we aren't careful.
    
    // Let's rely on standard parsing.
    const start = new Date(timeStr);
    
    // Add duration (in minutes)
    const end = new Date(start.getTime() + eventType.duration * 60000);
    
    // Format dates for MySQL (YYYY-MM-DD HH:MM:SS) - Using toISOString preserves the UTC calculations
    const formatDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

    // TODO: Validate that the slot is actually free (Slot utility needed)

    const bookingData = {
        ...req.body,
        start_time: formatDate(start),
        end_time: formatDate(end),
        duration: eventType.duration
    };

    const booking = await bookingService.createBooking(bookingData);
    res.status(201).json({
        status: 'success',
        data: { booking }
    });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    await bookingService.updateBookingStatus(req.params.id, 'cancelled', reason);
    res.status(200).json({
        status: 'success',
        message: 'Booking cancelled'
    });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
    const success = await bookingService.deleteBooking(req.params.id);
    if (!success) {
        throw new NotFoundError('Booking not found');
    }
    res.status(200).json({
        status: 'success',
        message: 'Booking deleted'
    });
});

exports.rescheduleBooking = asyncHandler(async (req, res) => {
    const oldBookingId = req.params.id;
    const { start_time } = req.body;

    const oldBooking = await bookingService.getBookingById(oldBookingId);
    if (!oldBooking) throw new NotFoundError('Booking not found');

    const eventType = await eventTypeService.getEventTypeById(oldBooking.event_type_id);
    
    // Treat the incoming string as UTC to preserve face value
    const timeStr = start_time.replace(' ', 'T') + (start_time.includes('Z') ? '' : 'Z');
    const start = new Date(timeStr);
    const end = new Date(start.getTime() + eventType.duration * 60000);

    const formatDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

    const newBookingData = {
        event_type_id: oldBooking.event_type_id,
        booker_name: oldBooking.booker_name,
        booker_email: oldBooking.booker_email,
        start_time: formatDate(start),
        end_time: formatDate(end)
    };
    
    const newBooking = await bookingService.rescheduleBooking(oldBookingId, newBookingData);
    res.status(200).json({
        status: 'success',
        data: { booking: newBooking }
    });
});
