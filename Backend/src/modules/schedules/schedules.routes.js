const express = require('express');
const scheduleController = require('./schedules.controller');

const router = express.Router();

router.get('/', scheduleController.getAllSchedules);
router.post('/', scheduleController.createSchedule);
router.get('/default', scheduleController.getDefaultSchedule);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

// Sub-resources
router.put('/:id/slots', scheduleController.updateWeeklySlots);
router.post('/:id/overrides', scheduleController.setDateOverride);
router.post('/:id/assign', scheduleController.toggleEventTypeAssignment);

module.exports = router;
