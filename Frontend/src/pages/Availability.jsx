import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  List, 
  Calendar as CalendarIcon, 
  MoreVertical, 
  Plus,
  Trash2,
  Copy,
  Info,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Repeat
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import scheduleService from '../services/schedule.service';
import eventTypesService from '../services/eventTypes.service';

const DateCustomCalendar = ({ isOpen, onClose, onSave, initialDate }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [slots, setSlots] = useState([{ start: '09:00', end: '17:00' }]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            if (initialDate) {
                const d = new Date(initialDate);
                setSelectedDate(d.toLocaleDateString('en-CA')); // YYYY-MM-DD
                setCurrentMonth(d);
            } else {
                setSelectedDate(null);
                setCurrentMonth(new Date());
            }
            setSlots([{ start: '09:00', end: '17:00' }]);
        }
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    // Calendar Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
             const date = new Date(year, month, day);
             const dateStr = date.toISOString().split('T')[0];
             const isToday = new Date().toISOString().split('T')[0] === dateStr;
             const isSelected = selectedDate === dateStr;

             days.push(
                <button 
                  key={day} 
                  onClick={() => {
                      setSelectedDate(dateStr);
                      // Don't switch step, stay on calendar + show options below
                  }}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors hover:bg-blue-50
                      ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      ${isToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}
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

    // Validations
    const addSlot = () => setSlots([...slots, { start: '09:00', end: '17:00' }]);
    const removeSlot = (idx) => setSlots(slots.filter((_, i) => i !== idx));
    const updateSlot = (idx, field, value) => {
        const newSlots = [...slots];
        newSlots[idx][field] = value;
        setSlots(newSlots);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                        Select a Custom Date
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full mb-4 px-2">
                            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
                            <span className="font-semibold text-gray-800">
                                {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2 w-full">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-xs font-semibold text-gray-500 uppercase h-8 flex items-center justify-center">{d}</div>
                        ))}
                        {renderCalendarDays()}
                    </div>
                </div>

                {selectedDate && (
                    <div className="mt-6 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2 duration-200">
                         <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-700">Hours for {selectedDate}</h4>
                         </div>
                         <div className="space-y-3 mb-6">
                            {slots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input 
                                        type="time" 
                                        value={slot.start} 
                                        onChange={(e) => updateSlot(index, 'start', e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 flex-1"
                                    />
                                    <span>-</span>
                                    <input 
                                        type="time" 
                                        value={slot.end} 
                                        onChange={(e) => updateSlot(index, 'end', e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 flex-1"
                                    />
                                    {slots.length > 1 && (
                                        <button onClick={() => removeSlot(index)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addSlot} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                <Plus size={14} /> Add Interval
                            </button>
                        </div>

                        <div className="flex justify-end gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button 
                                    onClick={() => {
                                        onSave(selectedDate, slots);
                                        onClose();
                                    }} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Apply Custom Hours
                                </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DateActionMenu = ({ isOpen, onClose, date, position, onEditDate, onEditWeek }) => {
     if (!isOpen || !date) return null;
     
     // Simple collision detection or constraints can be added here if needed
     // For now, render vertically below the click point
     
     return (
        <>
            <div className="fixed inset-0 z-[50]" onClick={onClose}></div>
            <div 
                className="fixed z-[60] bg-white rounded-lg shadow-xl border border-gray-100 w-64 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                style={{ top: position.y + 10, left: position.x }}
            >
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{date.toLocaleDateString("en-GB")}</span>
                </div>
                <div className="p-1">
                    <button 
                        onClick={onEditDate}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-2"
                    >
                         Edit date 
                    </button>
                    <button 
                         onClick={onEditWeek}
                         className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-2"
                    >
                         Edit all {date.toLocaleDateString('en-US', { weekday: 'long' })}s
                    </button>
                </div>
            </div>
        </>
     );
};

const AvailabilityCalendarView = ({ scheduleData, customDates, onDateClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    
    // Mapping from 'Sunday' -> index 0, matches scheduleData index
    const daysWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[100px] border-b border-r bg-gray-50/50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
             const date = new Date(year, month, day);
             const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD local
             
             // Determine availability
             let slots = customDates[dateStr];
             let isCustom = Boolean(slots);
             let isWeekly = false;
             
             if (!slots) {
                 // Check weekly schedule
                 const dayData = scheduleData[date.getDay()];
                 if (dayData && dayData.available) {
                     slots = dayData.slots;
                     isWeekly = true;
                 }
             }

             days.push(
                <div 
                    key={day} 
                    className={`min-h-[100px] border-b border-r p-2 hover:bg-gray-50 cursor-pointer transition-colors relative group ${isCustom ? 'bg-blue-50/30' : ''}`}
                    onClick={(e) => onDateClick(date, e)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`font-semibold text-sm ${
                           date.toDateString() === new Date().toDateString() 
                             ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                             : 'text-gray-700'
                        }`}>
                            {day}
                        </span>
                        {isCustom && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                Custom
                            </span>
                        )}
                        {isWeekly && (
                            <Repeat size={14} className="text-gray-400" />
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        {slots && slots.length > 0 ? (
                            slots.map((s, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-white border border-gray-100 rounded px-1 py-0.5 shadow-sm truncate">
                                    {s.start} - {s.end}
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-gray-400 italic pl-1">Unavailable</div>
                        )}
                    </div>
                </div>
             );
        }
        return days;
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    return (
        <div className="flex flex-col h-full border-t border-gray-200">
            <div className="flex justify-between items-center p-4 border-b">
                 <div className="flex items-center gap-4">
                     <span className="font-bold text-lg text-gray-800">
                        {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                     </span>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-600"><ChevronLeft size={20}/></button>
                     <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-600"><ChevronRight size={20}/></button>
                 </div>
            </div>
            
            <div className="grid grid-cols-7 text-center border-b bg-gray-50">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                    <div key={d} className="text-xs font-semibold text-gray-500 uppercase py-2 border-r last:border-r-0">{d}</div>
                ))}
            </div>
             <div className="grid grid-cols-7 auto-rows-fr bg-white">
                 {renderCalendarDays()}
             </div>
        </div>
    );
};

const Availability = () => {
  const [activeTab, setActiveTab] = useState('Schedules');
  const [scheduleId, setScheduleId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New State for Multi-schedule
  const [schedules, setSchedules] = useState([]);
  const [allEventTypes, setAllEventTypes] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [showActiveOnDropdown, setShowActiveOnDropdown] = useState(false);

  const [scheduleData, setScheduleData] = useState([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [timezone, setTimezone] = useState('UTC');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [customDates, setCustomDates] = useState({}); // Map date string YYYY-MM-DD -> slots
  
  // State for the choice menu popover
  const [choiceMenu, setChoiceMenu] = useState({ isOpen: false, date: null, position: { x: 0, y: 0 } });
  const [customInitialDate, setCustomInitialDate] = useState(null);

  // Default structure
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const initialStructure = daysMap.map((dayFull, index) => ({
      dayFull,
      day: dayFull.charAt(0),
      label: dayFull.substring(0, 3),
      available: false,
      slots: []
  }));

  const timezones = [
    'UTC', 
    'Asia/Kolkata', 
    'America/New_York', 
    'Europe/London'
  ];

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [schedulesData, typesData] = await Promise.all([
                scheduleService.getAllSchedules(),
                eventTypesService.getAllEventTypes()
            ]);
            setSchedules(schedulesData);
            setAllEventTypes(typesData);
            
            // Set default or first schedule if none selected
            if (schedulesData.length > 0 && !scheduleId) {
                const def = schedulesData.find(s => s.is_default) || schedulesData[0];
                setScheduleId(def.id); 
            } else if (schedulesData.length === 0) {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load availability data");
            setLoading(false);
        }
    };
    fetchInitialData();
  }, []);

  // Fetch Details on Schedule Change
  useEffect(() => {
    if (scheduleId) {
        fetchScheduleDetails(scheduleId);
    }
  }, [scheduleId]);

  const fetchScheduleDetails = async (id) => {
    setLoading(true);
    try {
        const schedule = await scheduleService.getScheduleById(id);
        console.log("Fetched schedule details:", schedule); // Debug log
        setCurrentSchedule(schedule);

        if (schedule) {
            if (schedule.timezone) setTimezone(schedule.timezone);
            
            // Transform slots to UI State
            const newData = JSON.parse(JSON.stringify(initialStructure));
            
            // Backend returns 'availability' for weekly slots. Fallback to empty array.
            // Ensure we handle case sensitivity for day names just in case.
            const slotsToProcess = schedule.availability || schedule.slots || [];
            console.log("Processing slots:", slotsToProcess); // Debug log

            slotsToProcess.forEach(slot => {
                // Formatting helper for time
                const formatTime = (t) => {
                    if (!t) return '09:00';
                    return t.length >= 5 ? t.substring(0, 5) : t;
                };

                // Find index case-insensitively
                const dayIndex = daysMap.findIndex(d => 
                    d.toLowerCase() === (slot.day_of_week || slot.day || '').toLowerCase()
                );

                if (dayIndex !== -1) {
                    newData[dayIndex].available = true;
                    newData[dayIndex].slots.push({
                        start: formatTime(slot.start_time || slot.start),
                        end: formatTime(slot.end_time || slot.end)
                    });
                } else {
                    console.warn("Could not map slot to day:", slot);
                }
            });
            setScheduleData(newData);

            // Process overrides to custom dates
            if (schedule.overrides) {
                const customMap = {};
                schedule.overrides.forEach(o => {
                    const dateStr = new Date(o.override_date).toISOString().split('T')[0];
                    if (!customMap[dateStr]) customMap[dateStr] = [];
                    customMap[dateStr].push({
                        start: o.start_time.substring(0, 5),
                        end: o.end_time.substring(0, 5)
                    });
                });
                setCustomDates(customMap);
            }
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to fetch schedule details");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
       const name = prompt("Enter schedule name:");
       if (!name) return;
       try {
           const newSchedule = await scheduleService.createSchedule({ name, timezone });
           setSchedules([...schedules, newSchedule]);
           setScheduleId(newSchedule.id);
           toast.success("Schedule created!");
       } catch (error) {
           console.error(error);
           toast.error("Failed to create schedule");
       }
  };

  const handleDeleteSchedule = async () => {
      if (!currentSchedule || currentSchedule.is_default) return;
      if (!window.confirm("Are you sure you want to delete this schedule? Event types assigned to it will be unassigned.")) return;

      try {
          await scheduleService.deleteSchedule(scheduleId);
          toast.success("Schedule deleted");
          
          const remaining = schedules.filter(s => s.id !== scheduleId);
          setSchedules(remaining);
          
          if (remaining.length > 0) {
              const next = remaining.find(s => s.is_default) || remaining[0];
              setScheduleId(next.id);
          } else {
              setScheduleId(null);
              setCurrentSchedule(null);
              setScheduleData([]);
          }
      } catch (error) {
          console.error(error);
          toast.error("Failed to delete schedule");
      }
  };

  const handleToggleEventAssignment = async (eventTypeId, currentStatus) => {
      // Optimistic Update
      setCurrentSchedule(prev => {
          if (!prev) return prev;
          const updatedEvents = !currentStatus 
            ? [...(prev.eventTypes || []), { id: eventTypeId }]
            : (prev.eventTypes || []).filter(e => e.id !== eventTypeId);
            
          return {
               ...prev,
               eventTypes: updatedEvents
          };
      });

      try {
          await scheduleService.toggleEventAssignment(scheduleId, eventTypeId, !currentStatus);
          // Toast for confirmation
          toast.success(currentStatus ? "Event type removed from schedule" : "Event type added to schedule");
      } catch (error) {
          console.error(error);
          toast.error("Failed to update assignment");
          // Revert on error by refetching
          fetchScheduleDetails(scheduleId);
      }
  };

  const saveScheduleToBackend = async (data, tz = null) => {
      if (!scheduleId) return;

      const apiSlots = [];
      data.forEach((dayData) => {
          if (dayData.available) {
              dayData.slots.forEach(slot => {
                  apiSlots.push({
                      day: dayData.dayFull,
                      start: slot.start,
                      end: slot.end
                  });
              });
          }
      });

      try {
          await scheduleService.updateWeeklySlots(scheduleId, apiSlots, tz || timezone);
          // toast.success("Saved");
      } catch (error) {
          console.error(error);
          toast.error("Failed to auto-save");
      }
  };

  const updateScheduleState = (dayIndex, newSlots, available) => {
      const newData = [...scheduleData];
      newData[dayIndex] = { ...newData[dayIndex], slots: newSlots, available };
      setScheduleData(newData);
      
      // Auto-save
      saveScheduleToBackend(newData);
  };

  // handleSaveWeekly is no longer needed but we can keep the logic if we want to save timezone explicitly or mass save
  // But user asked to remove save button. 

  const handleCustomSave = async (date, slots) => {
      if (!scheduleId) return;
      try {
          await scheduleService.setDateCustom(scheduleId, date, slots);
          toast.success("Custom date added!");
          // Refresh to see update
          fetchScheduleDetails(scheduleId);
      } catch (error) {
          console.error(error);
          toast.error("Failed to add custom date");
      }
  };

  const handleDateClick = (date, event) => {
    // Calculate a safe position for the dropdown
    // Start with just below the click, aligned left or centered
    const rect = event.currentTarget.getBoundingClientRect();
    
    // We want the menu to appear near the mouse click or the cell top-left
    // Let's use the click coordinates but ensure it stays on screen
    let x = event.clientX;
    let y = event.clientY;

    setChoiceMenu({ 
        isOpen: true, 
        date, 
        position: { x, y } 
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8 w-full  relative">
       <Toaster position="top-center" />
       <h1 className="text-3xl font-bold text-gray-800 mb-6">Availability</h1>
       
       <DateCustomCalendar 
         isOpen={isCustomModalOpen} 
         onClose={() => setIsCustomModalOpen(false)}
         onSave={handleCustomSave}
         initialDate={customInitialDate}
       />
       
       <DateActionMenu
         isOpen={choiceMenu.isOpen}
         date={choiceMenu.date}
         position={choiceMenu.position}
         onClose={() => setChoiceMenu({ ...choiceMenu, isOpen: false })}
         onEditDate={() => {
             const d = choiceMenu.date;
             setChoiceMenu({ ...choiceMenu, isOpen: false });
             setCustomInitialDate(d);
             setIsCustomModalOpen(true);
         }}
         onEditWeek={() => {
             setChoiceMenu({ ...choiceMenu, isOpen: false });
             setViewMode('list');
         }}
       />

       {/* Tabs */}
       <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {['Schedules', 'Calendar settings', 'Advanced settings'].map((tab) => (
          <button
            key={tab}
            className={`pb-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
             onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 relative">
                  {/* Schedule Selector */}
                  <div className="relative flex items-center gap-2">
                      <button 
                          onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                          className="flex items-center gap-2 text-xl font-bold text-blue-600 cursor-pointer hover:underline"
                      >
                          {currentSchedule?.name || 'Loading...'} 
                          {currentSchedule?.is_default ? <span className="text-sm font-normal text-gray-500">(default)</span>:null}
                          <ChevronDown size={20} className={`transform transition-transform ${showScheduleDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {currentSchedule && !currentSchedule.is_default && (
                          <button 
                              onClick={handleDeleteSchedule}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete this schedule"
                          >
                              <Trash2 size={16} />
                          </button>
                      )}

                      {showScheduleDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
                              <div className="max-h-60 overflow-y-auto">
                                  {schedules.map(s => (
                                      <button
                                          key={s.id}
                                          onClick={() => {
                                              setScheduleId(s.id);
                                              setShowScheduleDropdown(false);
                                          }}
                                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex justify-between items-center ${
                                              scheduleId === s.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                          }`}
                                      >
                                          <span className="truncate">{s.name}</span>
                                          {s.is_default && <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Default</span>}
                                      </button>
                                  ))}
                              </div>
                              <div className="border-t border-gray-100 p-2">
                                   <button 
                                      onClick={() => {
                                          handleCreateSchedule();
                                          setShowScheduleDropdown(false);
                                      }}
                                      className="w-full flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded-md text-sm font-medium transition-colors"
                                   >
                                       <Plus size={16} />
                                       New schedule
                                   </button>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Active On Selector */}
                  <div className="relative">
                      <button 
                          onClick={() => setShowActiveOnDropdown(!showActiveOnDropdown)}
                          className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:underline"
                      >
                          <span>Active on: <span className="font-semibold">{currentSchedule?.eventTypes?.length || 0} event types</span></span>
                          <ChevronDown size={14} className={`transform transition-transform ${showActiveOnDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showActiveOnDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2">
                              {/* Group 1: Mapped to Current Schedule */}
                              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase">Mapped to this schedule</h4>
                              </div>
                              <div className="p-2 space-y-1">
                                  {allEventTypes.filter(e => currentSchedule?.eventTypes?.some(assigned => assigned.id === e.id)).map(event => (
                                      <label key={event.id} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                                          <input 
                                              type="checkbox"
                                              checked={true}
                                              onChange={() => handleToggleEventAssignment(event.id, true)}
                                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                          />
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.accent_color || '#8b5cf6' }} />
                                              <span className="text-sm font-medium text-gray-700 truncate">{event.title}</span>
                                          </div>
                                      </label>
                                  ))}
                                  {allEventTypes.filter(e => currentSchedule?.eventTypes?.some(assigned => assigned.id === e.id)).length === 0 && (
                                      <div className="text-xs text-gray-400 p-2 italic">None</div>
                                  )}
                              </div>

                              {/* Group 2: Not Mapped (or Mapped to Others) */}
                              <div className="px-4 py-2 border-t border-b border-gray-100 bg-gray-50/50">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase">Not mapped to this schedule</h4>
                              </div>
                              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                                  {allEventTypes.filter(e => !currentSchedule?.eventTypes?.some(assigned => assigned.id === e.id)).map(event => (
                                      <label key={event.id} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                                          <input 
                                              type="checkbox"
                                              checked={false}
                                              onChange={() => handleToggleEventAssignment(event.id, false)}
                                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                          />
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.accent_color || '#8b5cf6' }} />
                                              <span className="text-sm font-medium text-gray-700 truncate">{event.title}</span>
                                          </div>
                                      </label>
                                  ))}
                                   {allEventTypes.filter(e => !currentSchedule?.eventTypes?.some(assigned => assigned.id === e.id)).length === 0 && (
                                      <div className="text-xs text-gray-400 p-2 italic">All event types assigned</div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button 
                         onClick={() => setViewMode('list')}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                         <List size={16} /> List
                      </button>
                      <button 
                         onClick={() => setViewMode('calendar')}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                         <CalendarIcon size={16} /> Calendar
                      </button>
                  </div>
              </div>
          </div>

          {/* Card Body - Grid Layout */}
          {viewMode === 'calendar' ? (
              <AvailabilityCalendarView 
                  scheduleData={scheduleData} 
                  customDates={customDates} 
                  onDateClick={handleDateClick}
              />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              
              {/* Weekly Hours Column */}
              <div className="md:col-span-2 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-gray-800">Weekly hours</div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Set when you are typically available for meetings</p>

                  <div className="space-y-4">
                      {scheduleData.map((item, index) => (
                          <div key={index} className="flex items-start gap-4">
                              {/* Day Circle */}
                              <div className="flex flex-col items-center gap-2 pt-2">
                                  <button 
                                    onClick={() => updateScheduleState(index, item.slots.length ? item.slots : [{start: '09:00', end: '17:00'}], !item.available)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors uppercase ${item.available ? 'bg-gray-100 text-gray-900 border border-gray-300' : 'bg-white text-gray-400 border border-gray-200'}`}
                                  >
                                      {item.day}
                                  </button>
                              </div>

                              {/* Hours Input or Unavailable */}
                              <div className="flex-1 pt-1">
                                  {!item.available ? (
                                      <div className="flex items-center gap-3 h-10">
                                          <span className="text-gray-500 text-sm">Unavailable</span>
                                          <button 
                                            onClick={() => updateScheduleState(index, [{start: '09:00', end: '17:00'}], true)}
                                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                          >
                                              <Plus size={18} />
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="flex flex-col gap-2">
                                          {item.slots.map((slot, slotIndex) => (
                                              <div key={slotIndex} className="flex items-center gap-2 flex-wrap">
                                                  <div className="flex items-center gap-2">
                                                      <input 
                                                        type="time" 
                                                        value={slot.start} 
                                                        onChange={(e) => {
                                                            const newSlots = [...item.slots];
                                                            newSlots[slotIndex].start = e.target.value;
                                                            updateScheduleState(index, newSlots, true);
                                                        }}
                                                        className="w-32 px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                                      />
                                                      <span className="text-gray-400">-</span>
                                                      <input 
                                                        type="time" 
                                                        value={slot.end}
                                                        onChange={(e) => {
                                                            const newSlots = [...item.slots];
                                                            newSlots[slotIndex].end = e.target.value;
                                                            updateScheduleState(index, newSlots, true);
                                                        }}
                                                        className="w-32 px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                                      />
                                                  </div>
                                                  <div className="flex items-center gap-1 ml-2">
                                                      <button 
                                                        onClick={() => {
                                                            const newSlots = item.slots.filter((_, i) => i !== slotIndex);
                                                            if (newSlots.length === 0) {
                                                                updateScheduleState(index, [], false);
                                                            } else {
                                                                updateScheduleState(index, newSlots, true);
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600"
                                                      >
                                                          <Trash2 size={18} />
                                                      </button>
                                                      {slotIndex === item.slots.length - 1 && (
                                                          <button 
                                                            onClick={() => {
                                                                const newSlots = [...item.slots, { start: '09:00', end: '17:00' }];
                                                                updateScheduleState(index, newSlots, true);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-600"
                                                          >
                                                              <Plus size={18} />
                                                          </button>
                                                      )}
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Date-specific Hours Column */}
              <div className="p-6">
                 <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon size={18} className="text-gray-600" />
                    <div className="font-semibold text-gray-800">Date-specific hours</div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Adjust hours for specific days</p>
                  
                  <button 
                    onClick={() => setIsCustomModalOpen(true)}
                    className="flex items-center gap-2 text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full text-sm font-medium transition-colors w-full justify-center md:w-auto"
                  >
                    <Plus size={16} />
                    Add custom hours
                  </button>
              </div>
          </div>
          )}
          
           {/* Card Footer */}
           <div className="p-6 border-t border-gray-200">
                <div className="relative inline-block">
                    <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline pointer-events-none">
                        <Globe size={16} />
                        <select 
                            value={timezone} 
                            onChange={(e) => {
                                const newTz = e.target.value;
                                setTimezone(newTz);
                                saveScheduleToBackend(scheduleData, newTz);
                            }}
                            className="bg-transparent border-none outline-none text-blue-600 font-medium appearance-none cursor-pointer pointer-events-auto"
                        >
                            {timezones.map(tz => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} />
                    </button>
                    <div className="text-xs text-gray-500 mt-1 pl-6">
                        (Updates are saved automatically)
                    </div>
                </div>
           </div>
      </div>
    </div>
  );
};

export default Availability;
                                                  