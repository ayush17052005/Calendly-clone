const scheduleService = require('./schedules.service');
const asyncHandler = require('../../utils/asyncHandler');
const { NotFoundError } = require('../../utils/errors');

exports.getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await scheduleService.getAllSchedules();
  res.json({
    success: true,
    data: { schedules }
  });
});

exports.getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);
  if (!schedule) {
    throw new NotFoundError('Schedule not found');
  }
  res.json({
    success: true,
    data: { schedule }
  });
});

exports.createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body);
  res.status(201).json({
    success: true,
    data: { schedule }
  });
});

exports.updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
  // Note: updateSchedule in service calls getScheduleById, which returns null if not found.
  if (!schedule) {
    throw new NotFoundError('Schedule not found');
  }
  res.json({
    success: true,
    data: { schedule }
  });
});

exports.getDefaultSchedule = asyncHandler(async (req, res) => {
    const schedule = await scheduleService.getDefaultSchedule();
    if (!schedule) {
        return res.status(404).json({ status: 'error', message: 'No default schedule found' });
    }
    res.status(200).json({
        status: 'success',
        data: { schedule }
    });
});

exports.updateWeeklySlots = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { slots, timezone } = req.body; 
    
    // Check if schedule exists?
    const updatedSchedule = await scheduleService.updateWeeklySlots(id, slots, timezone);
    res.status(200).json({
        status: 'success',
        data: { schedule: updatedSchedule }
    });
});

exports.setDateOverride = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, slots } = req.body; 
    
    const overrides = await scheduleService.setDateOverride(id, date, slots);
    res.status(200).json({
        status: 'success',
        data: { overrides }
    });
});

exports.toggleEventTypeAssignment = asyncHandler(async (req, res) => {
    const { eventTypeId, assign } = req.body;
    await scheduleService.toggleEventTypeAssignment(req.params.id, eventTypeId, assign);
    res.json({
        success: true,
        message: assign ? 'Event assigned to schedule' : 'Event unassigned from schedule'
    });
});

exports.deleteSchedule = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id);
  res.json({
    success: true,
    message: 'Schedule deleted'
  });
});
