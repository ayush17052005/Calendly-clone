import api from './api';

const eventTypesService = {
  // Get all event types
  getAllEventTypes: async () => {
    const response = await api.get('/event-types');
    // Backend API response structure: { status: 'success', results: n, data: { eventTypes: [...] } }
    return response.data?.data?.eventTypes || [];
  },

  // Get a single event type by ID
  getEventTypeById: async (id) => {
    const response = await api.get(`/event-types/${id}`);
    return response.data?.data?.eventType;
  },

  getEventTypeBySlug: async (slug) => {
    const response = await api.get(`/event-types/public/${slug}`);
    return response.data?.data?.eventType;
  },

  // Get slots for a specific event type
  getEventSlots: async (id, date, timezone) => {
    const response = await api.get(`/event-types/${id}/slots`, {
      params: { date, timezone },
    });
    return response.data?.data?.slots || [];
  },
    });
    return response.data;
  },

  // Create a new event type
  createEventType: async (data) => {
    const response = await api.post('/event-types', data);
    return response.data;
  },

  // Update an event type
  updateEventType: async (id, data) => {
    const response = await api.patch(`/event-types/${id}`, data);
    return response.data;
  },

  // Delete an event type
  deleteEventType: async (id) => {
    const response = await api.delete(`/event-types/${id}`);
    return response.data;
  }
};

export default eventTypesService;
