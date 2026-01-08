const express = require('express');
const scheduleController = require('./schedules.controller');

const router = express.Router();

router.get('/default', scheduleController.getDefaultSchedule);
router.put('/:id/slots', scheduleController.updateWeeklySlots);
router.post('/:id/overrides', scheduleController.setDateOverride);

module.exports = router;
