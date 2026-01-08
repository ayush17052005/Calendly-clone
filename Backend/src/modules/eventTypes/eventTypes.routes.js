const express = require('express');
const eventTypeController = require('./eventTypes.controller');

const router = express.Router();

router.route('/')
  .get(eventTypeController.getEventTypes)
  .post(eventTypeController.createEventType);

router.get('/public/:slug', eventTypeController.getEventTypeBySlug);

router.route('/:id')
  .get(eventTypeController.getEventType)
  .patch(eventTypeController.updateEventType)
  .delete(eventTypeController.deleteEventType);

router.get('/:id/slots', eventTypeController.getAvailableSlots);

module.exports = router;
