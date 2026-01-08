const bookingService = require('./bookings.service');
const eventTypeService = require('../eventTypes/eventTypes.service');
const asyncHandler = require('../../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

exports.getBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getBookings();
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

    const start = new Date(start_time);
    const end = new Date(start.getTime() + eventType.duration * 60000);
    
    // TODO: Validate that the slot is actually free (Slot utility needed)

    const bookingData = {
        ...req.body,
        end_time: end,
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

exports.rescheduleBooking = asyncHandler(async (req, res) => {
    const oldBookingId = req.params.id;
    const { start_time } = req.body;

    const oldBooking = await bookingService.getBookingById(oldBookingId);
    if (!oldBooking) throw new NotFoundError('Booking not found');

    const eventType = await eventTypeService.getEventTypeById(oldBooking.event_type_id);
    const start = new Date(start_time);
    const end = new Date(start.getTime() + eventType.duration * 60000);

    const newBookingData = {
        event_type_id: oldBooking.event_type_id,
        booker_name: oldBooking.booker_name,
        booker_email: oldBooking.booker_email,
        start_time: start,
        end_time: end
    };
    
    const newBooking = await bookingService.rescheduleBooking(oldBookingId, newBookingData);
    res.status(200).json({
        status: 'success',
        data: { booking: newBooking }
    });
});
