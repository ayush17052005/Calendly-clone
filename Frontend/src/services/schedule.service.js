import api from './api';

const scheduleService = {
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
  }
};

export default scheduleService;
