// Frontend/src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Globe, 
  Calendar,
  CheckCircle,
  AlertCircle,
  X // Import X for close button
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import eventTypesService from '../services/eventTypes.service';
import bookingsService from '../services/bookings.service';

// Basic Calendar Component
const CalendarPicker = ({ onDateSelect, selectedDate, availableDates = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        const today = new Date();
        today.setHours(0,0,0,0);

        for (let day = 1; day <= daysInMonth; day++) {
             const date = new Date(year, month, day);
             const dateStr = date.toLocaleDateString('en-CA');
             const isPast = date < today;
             // Simplified availability check: assume logic handles checks later or pass availableDates
             // For now, enable all future dates visually, or strictly
             
             const isSelected = selectedDate === dateStr;
             const isToday = today.toISOString().split('T')[0] === dateStr;

             days.push(
                <button 
                  key={day} 
                  disabled={isPast}
                  onClick={() => onDateSelect(dateStr)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors 
                      ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700'}
                      ${isToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}
                      ${isPast ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : ''}
                  `}
                >
                    {day}
                </button>
             );
        }
        return days;
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const canPrev = currentMonth > new Date(); // roughly

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-between items-center w-full px-4 mb-4">
                 <span className="font-semibold text-gray-800">
                    {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                 </span>
                 <div className="flex gap-1">
                     <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={20}/></button>
                     <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={20}/></button>
                 </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2 w-full max-w-[300px]">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                    <div key={d} className="text-[10px] font-semibold text-gray-500 uppercase h-8 flex items-center justify-center">{d}</div>
                ))}
                {renderCalendarDays()}
            </div>
        </div>
    );
};

const BookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState(null);
  
  // Selection State
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); // { start: 'HH:mm', end: 'HH:mm' }
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Form State
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error

  useEffect(() => {
    const fetchEvent = async () => {
        try {
            const data = await eventTypesService.getEventTypeBySlug(slug);
            if (data) {
                setEventType(data);
                // Set default timezone if needed
            } else {
                toast.error("Event type not found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load event");
        } finally {
            setLoading(false);
        }
    };
    fetchEvent();
  }, [slug]);

  useEffect(() => {
      if (!selectedDate || !eventType) return;
      
      const fetchSlots = async () => {
          setFetchingSlots(true);
          setAvailableSlots([]);
          setSelectedSlot(null);
          try {
              // Fetch slots for this date
              const slots = await eventTypesService.getEventSlots(eventType.id, selectedDate, eventType.timezone);
              setAvailableSlots(slots);
          } catch (error) {
              console.error(error);
              toast.error("Failed to load slots");
          } finally {
              setFetchingSlots(false);
          }
      };
      
      fetchSlots();
  }, [selectedDate, eventType]);

  const handleBookMeeting = async () => {
      if (!bookerName || !bookerEmail) {
          toast.error("Please fill in your details");
          return;
      }

      
      setBookingStatus('submitting');
      
      try {
          // Combine Date and Time
          const startDateTime = `${selectedDate} ${selectedSlot.start}:00`;
          
          console.log("Booking with:", {
              event_type_id: eventType.id,
              booker_name: bookerName,
              booker_email: bookerEmail,
              start_time: startDateTime
          });
          
          await bookingsService.createBooking({
              event_type_id: eventType.id,
              booker_name: bookerName,
              booker_email: bookerEmail,
              start_time: startDateTime
          });

          setBookingStatus('success');
          toast.success("Meeting booked successfully!");
      } catch (error) {
          console.error(error);
          toast.error("Failed to book meeting");
          setBookingStatus('error');
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!eventType) return <div className="flex h-screen items-center justify-center">Event Type Not Found</div>;

  if (bookingStatus === 'success') {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                      <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmed</h2>
                  <p className="text-gray-600 mb-6">You are scheduled with {eventType.host_name}.</p>
                  <div className="border-t border-gray-100 pt-4 text-left space-y-2 text-sm text-gray-700">
                      <div className="flex gap-2"><strong className="w-20">When:</strong> {selectedDate} {selectedSlot?.start} - {selectedSlot?.end}</div>
                      <div className="flex gap-2"><strong className="w-20">Who:</strong> {bookerName}</div>
                      <div className="flex gap-2"><strong className="w-20">Where:</strong> {eventType.location}</div>
                  </div>
                  <div className=" mt-6 text-gray-500 text-sm">
                    <button onClick={() => window.location.href = '/meetings'} className="text-blue-600 hover:underline">Go back to meetings</button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
        <Toaster position="top-center" />
      
        {/* Close Button */}
        <button 
           onClick={() => navigate('/scheduling')}
           className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors z-50 hover:bg-gray-100"
           title="Close and go to scheduling"
        >
            <X size={24} />
        </button>

      <div className="bg-white rounded-lg shadow-xl flex flex-col md:flex-row max-w-5xl w-full min-h-[600px] overflow-hidden">
        
        {/* Left Column: Details */}
        <div className="w-full md:w-1/3 border-r border-gray-100 p-8 flex flex-col">
           <div className="mb-6">
               <div className="text-gray-500 font-medium text-sm mb-1">{eventType.host_name}</div>
               <h1 className="text-2xl font-bold text-gray-900 mb-4">{eventType.title}</h1>
               
               <div className="space-y-3 text-gray-600">
                   <div className="flex items-center gap-3">
                       <Clock size={18} />
                       <span>{eventType.duration} min</span>
                   </div>
                   <div className="flex items-center gap-3">
                       <MapPin size={18} />
                       <span>{eventType.location || 'Google Meet'}</span>
                   </div>
               </div>
           </div>

           <div className="mt-8 flex-1">
               <h3 className="font-bold text-gray-800 mb-3">Invitee Details</h3>
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name *</label>
                       <input 
                          type="text" 
                          value={bookerName}
                          onChange={e => setBookerName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email *</label>
                       <input 
                          type="email" 
                          value={bookerEmail}
                          onChange={e => setBookerEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                   </div>
                   <div className="pt-2">
                       <button 
                          disabled={!selectedSlot || bookingStatus === 'submitting'}
                          onClick={handleBookMeeting}
                          className={`w-full py-2.5 rounded-full font-bold transition-colors ${
                              selectedSlot 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                       >
                           {bookingStatus === 'submitting' ? 'Booking...' : 'Book Meeting'}
                       </button>
                   </div>
               </div>
           </div>
        </div>

        {/* Right Column: Calendar & Slots */}
        <div className="w-full md:w-2/3 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Select a Date & Time</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Calendar */}
                <div className="flex-1">
                     <CalendarPicker 
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                     />
                     <div className="mt-4 text-sm text-gray-500 flex items-center gap-2 justify-center">
                         <Globe size={14} />
                         <span>{eventType.timezone}</span>
                     </div>
                </div>

                {/* Slots - Show only if date selected */}
                {selectedDate && (
                    <div className="w-full md:w-48 animate-in slide-in-from-right duration-300">
                        <h4 className="font-semibold text-gray-700 mb-3 text-center md:text-left">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h4>
                        
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {fetchingSlots ? (
                                <div className="text-center py-4 text-gray-400">Loading...</div>
                            ) : availableSlots.length === 0 ? (
                                <div className="text-center py-4 text-gray-400 text-sm">No slots available</div>
                            ) : (
                                availableSlots.map((timeStr, idx) => {
                                    // 12-hour format conversion
                                    const formatTime12 = (t) => {
                                        const [h, m] = t.split(':').map(Number);
                                        const suffix = h >= 12 ? 'pm' : 'am';
                                        const h12 = h % 12 || 12;
                                        return `${h12}:${m.toString().padStart(2, '0')}${suffix}`;
                                    };

                                    return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            // Calculate end time
                                            const [h, m] = timeStr.split(':').map(Number);
                                            const endDate = new Date();
                                            endDate.setHours(h, m + eventType.duration, 0);
                                            const endStr = endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                            
                                            setSelectedSlot({ start: timeStr, end: endStr });
                                        }}
                                        className={`w-full py-2 px-1 border rounded font-medium text-sm transition-all ${
                                            selectedSlot?.start === timeStr
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                                                : 'text-blue-600 border-blue-200 hover:border-blue-600 bg-blue-50/50'
                                        }`}
                                    >
                                        {formatTime12(timeStr)} 
                                    </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
