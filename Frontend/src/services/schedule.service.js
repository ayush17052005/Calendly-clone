import api from './api';

const scheduleService = {
  getAllSchedules: async () => {
    const response = await api.get('/schedules');
    return response.data?.data?.schedules || [];
  },

  getScheduleById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data?.data?.schedule;
  },

  createSchedule: async (data) => {
    const response = await api.post('/schedules', data);
    return response.data?.data?.schedule;
  },

  updateSchedule: async (id, data) => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data?.data?.schedule;
  },

  deleteSchedule: async (id) => {
     const response = await api.delete(`/schedules/${id}`);
     return response.data;
  },

  // Backward compatibility / convenience
  getDefaultSchedule: async () => {
    const response = await api.get('/schedules/default');
    return response.data?.data?.schedule;
  },

  updateWeeklySlots: async (id, slots, timezone) => {
    // slots: Array of { day, start, end }
    const response = await api.put(`/schedules/${id}/slots`, { slots, timezone });
    return response.data?.data?.schedule;
  },

  setDateCustom: async (id, date, slots) => {
    const response = await api.post(`/schedules/${id}/overrides`, { date, slots });
    return response.data?.data?.overrides;
  },

  toggleEventAssignment: async (scheduleId, eventTypeId, assign) => {
      const response = await api.post(`/schedules/${scheduleId}/assign`, { eventTypeId, assign });
      return response.data;
  }
};

export default scheduleService;
