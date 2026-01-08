import api from './api';

const bookingsService = {
  // Get all bookings
  getAllBookings: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data?.data?.bookings || [];
  },

  // Create a new booking
  createBooking: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Reschedule a booking
  rescheduleBooking: async (id, newSlot) => {
    const response = await api.post(`/bookings/${id}/reschedule`, newSlot);
    return response.data;
  }
};

export default bookingsService;
