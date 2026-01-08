const scheduleService = require('./schedules.service');
const asyncHandler = require('../../utils/asyncHandler');
const { NotFoundError } = require('../../utils/errors');

exports.getDefaultSchedule = asyncHandler(async (req, res) => {
    const schedule = await scheduleService.getDefaultSchedule();
    if (!schedule) {
        // Fallback or create one?
        // For now, return 404 or empty
        return res.status(404).json({ status: 'error', message: 'No default schedule found' });
    }
    res.status(200).json({
        status: 'success',
        data: { schedule }
    });
});

exports.updateWeeklySlots = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { slots, timezone } = req.body; // Expects array of { day: 'Monday', start: '09:00', end: '17:00' }
    
    const updatedSchedule = await scheduleService.updateWeeklySlots(id, slots, timezone);
    res.status(200).json({
        status: 'success',
        data: { schedule: updatedSchedule }
    });
});

exports.setDateOverride = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, slots } = req.body; // Expects date "YYYY-MM-DD", slots array
    
    const overrides = await scheduleService.setDateOverride(id, date, slots);
    res.status(200).json({
        status: 'success',
        data: { overrides }
    });
});
