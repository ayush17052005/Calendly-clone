const eventTypeService = require('./eventTypes.service');
const bookingService = require('../bookings/bookings.service');
const asyncHandler = require('../../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const { generateSlots } = require('../../utils/slot.utils');

exports.getEventTypes = asyncHandler(async (req, res) => {
  const eventTypes = await eventTypeService.getAllEventTypes();
  res.status(200).json({
    status: 'success',
    results: eventTypes.length,
    data: { eventTypes }
  });
});

exports.createEventType = asyncHandler(async (req, res) => {
  const eventType = await eventTypeService.createEventType(req.body);
  res.status(201).json({
    status: 'success',
    data: { eventType }
  });
});

exports.updateEventType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const eventType = await eventTypeService.updateEventType(id, req.body);
    
    if (!eventType) {
        throw new NotFoundError('Event Type not found');
    }

    res.status(200).json({
        status: 'success',
        data: { eventType }
    });
});

exports.deleteEventType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await eventTypeService.deleteEventType(id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getEventType = asyncHandler(async (req, res) => {
    const eventType = await eventTypeService.getEventTypeById(req.params.id);
    if (!eventType) {
        throw new NotFoundError('Event Type not found');
    }
    res.status(200).json({
        status: 'success',
        data: { eventType }
    });
});

exports.getAvailableSlots = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
        throw new BadRequestError('Date query parameter is required');
    }

    const eventType = await eventTypeService.getEventTypeById(id);
    if (!eventType) {
        throw new NotFoundError('Event Type not found');
    }

    // 1. Determine Weekday from Date
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    // 2. Get Availability for that day (or override)
    let availability = [];
    
    // Check specific overrides
    if (eventType.overrides && eventType.overrides.length > 0) {
        const override = eventType.overrides.find(o => 
            new Date(o.override_date).toISOString().slice(0,10) === date
        );
        if (override) {
            if (override.start_time !== override.end_time) {
                availability = [override];
            }
        } else {
            availability = eventType.availability ? eventType.availability.filter(slot => slot.day_of_week === dayOfWeek) : [];
        }
    } else {
         availability = eventType.availability ? eventType.availability.filter(slot => slot.day_of_week === dayOfWeek) : [];
    }

    // 3. Get Bookings for that day
    const dayStart = new Date(date);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23,59,59,999);

    const bookings = await bookingService.getBookingsForEventAndDateRange(id, dayStart, dayEnd);

    // 4. Generate Slots
    const slots = generateSlots({
        date,
        availability,
        bookings,
        duration: eventType.duration,
        bufferBefore: eventType.buffer_before,
        bufferAfter: eventType.buffer_after
    });

    res.status(200).json({
        status: 'success',
        date,
        dayOfWeek,
        data: { slots }
    });
});
