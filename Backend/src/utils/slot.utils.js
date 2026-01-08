// Helper to parse "HH:MM:SS" to minutes from midnight
const timeToMinutes = (timeStr) => {
    // Check if timeStr is valid
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Helper to convert minutes from midnight back to "HH:MM"
const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Generate available time slots
 * @param {Object} params
 * @param {string} params.date - YYYY-MM-DD
 * @param {Array} params.availability - [{ start_time: '09:00:00', end_time: '17:00:00' }]
 * @param {Array} params.bookings - [{ start_time: Date, end_time: Date }]
 * @param {number} params.duration - in minutes
 * @param {number} params.bufferBefore - in minutes
 * @param {number} params.bufferAfter - in minutes
 * @returns {Array} List of start times (ISO strings or HH:MM)
 */
exports.generateSlots = ({ date, availability, bookings, duration, bufferBefore = 0, bufferAfter = 0 }) => {
    const slots = [];
    // Ensure availability is not empty/null
    if (!availability || availability.length === 0) return [];

    availability.forEach(window => {
        const windowStartMin = timeToMinutes(window.start_time);
        const windowEndMin = timeToMinutes(window.end_time);

        // Interval to generate slots from
        let currentSlotStart = windowStartMin;

        while (currentSlotStart + duration <= windowEndMin) {
            const currentSlotEnd = currentSlotStart + duration;
            
            // Construct Slot Date Objects for comparison
            // Note: We use the local date string components to avoid timezone shifts when constructing "today's" date
            const YMD = date.split('-').map(Number);
            // Construct start/end using explicit components to rely on system local time consistent with DB
            // Or better: Use UTC? For this assignment, we use loose date matching.
            
            const slotStartTime = new Date(YMD[0], YMD[1] - 1, YMD[2], Math.floor(currentSlotStart / 60), currentSlotStart % 60, 0, 0);
            const slotEndTime = new Date(YMD[0], YMD[1] - 1, YMD[2], Math.floor(currentSlotEnd / 60), currentSlotEnd % 60, 0, 0);

            // Check overlap
            const isConflict = bookings && bookings.some(booking => {
                const bookingStart = new Date(booking.start_time);
                const bookingEnd = new Date(booking.end_time);

                // Add Buffers to Booking
                const bufferedBookingStart = new Date(bookingStart.getTime() - bufferAfter * 60000); 
                const bufferedBookingEnd = new Date(bookingEnd.getTime() + bufferBefore * 60000);   

                // Check intersection: (StartA < EndB) and (EndA > StartB)
                return (
                    (slotStartTime < bufferedBookingEnd) && 
                    (slotEndTime > bufferedBookingStart)
                );
            });

            if (!isConflict) {
                slots.push(minutesToTime(currentSlotStart));
            }

            // Step size: duration
             currentSlotStart += duration; 
        }
    });

    return slots;
};
