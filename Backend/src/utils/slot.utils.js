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
 * @param {string} params.bookingType - 'one_on_one' | 'group'
 * @param {number} params.capacity - max seats
 * @returns {Array} List of slots objects { time: 'HH:MM', available_seats: number }
 */
exports.generateSlots = ({ date, availability, bookings, duration, bufferBefore = 0, bufferAfter = 0, bookingType = 'one_on_one', capacity = 1 }) => {
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
            const YMD = date.split('-').map(Number);
            
            const slotStartTime = new Date(YMD[0], YMD[1] - 1, YMD[2], Math.floor(currentSlotStart / 60), currentSlotStart % 60, 0, 0);
            const slotEndTime = new Date(YMD[0], YMD[1] - 1, YMD[2], Math.floor(currentSlotEnd / 60), currentSlotEnd % 60, 0, 0);

            // Find overlaps
            const overlappingBookings = bookings ? bookings.filter(booking => {
                const bookingStart = new Date(booking.start_time);
                const bookingEnd = new Date(booking.end_time);

                // Add Buffers to Booking (assuming simple buffer logic mainly for 1-1, but applies to group time block too)
                // For group, usually buffer applies to the block itself, so if one person books 9-10, can another book 9:05? No.
                // We assume strict slot alignment for this MVP.
                
                return (
                    (slotStartTime < bookingEnd) && 
                    (slotEndTime > bookingStart)
                );
            }) : [];

            const bookedCount = overlappingBookings.length;
            
            let isAvailable = false;
            let seatsLeft = 1;

            if (bookingType === 'group') {
                const maxCap = capacity || 1;
                isAvailable = bookedCount < maxCap;
                seatsLeft = maxCap - bookedCount;
            } else {
                isAvailable = bookedCount === 0;
                seatsLeft = 1;
            }

            if (isAvailable) {
                // Return object structure to support seat count
                slots.push({
                    time: minutesToTime(currentSlotStart),
                    available_seats: seatsLeft
                });
            }

            // Step size: duration
             currentSlotStart += duration; 
        }
    });

    return slots;
};
