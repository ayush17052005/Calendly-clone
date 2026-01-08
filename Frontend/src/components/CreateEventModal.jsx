import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Edit2,
  Video,
  Phone,
  MapPin as MapPinIcon,
  Globe,
  Check
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import eventTypesService from '../services/eventTypes.service';
import scheduleService from '../services/schedule.service';

const CreateEventModal = ({ isOpen, onClose, isModal = true, onEventCreate, initialData = null }) => {
  const [title, setTitle] = useState('New Meeting');
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [expandedSection, setExpandedSection] = useState('duration');
  
  // Form States
  const [duration, setDuration] = useState('30');
  const [customDuration, setCustomDuration] = useState('');
  const [locationType, setLocationType] = useState('');
  
  // Schedule State
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  
  // Host State
  const [hostName, setHostName] = useState('Ayush Saha');
  const [hostEmail, setHostEmail] = useState(''); 
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [accentColor, setAccentColor] = useState('#8b5cf6'); // Default purple
  const [showColorPicker, setShowColorPicker] = useState(false);

  const PRESET_COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet (Default)
    '#EC4899', // Pink
    '#64748B'  // Slate
  ];

  // Initialize form when initialData changes
  useEffect(() => {
    const loadInit = async () => {
        if (initialData) {
            setTitle(initialData.title || 'New Meeting');
            setSlug(initialData.slug || '');
            setIsSlugEdited(!!initialData.slug);
            setDuration(initialData.duration?.toString() || '30');
            setLocationType(initialData.location || '');
            setHostName(initialData.host_name || 'Ayush Saha');
            setHostEmail(initialData.host_email || '');
            setAccentColor(initialData.accent_color || '#8b5cf6');
            if (initialData.schedule_id) {
                setSelectedScheduleId(initialData.schedule_id);
            }
        } else {
            // Reset defaults
            setTitle('New Meeting');
            setSlug('');
            setIsSlugEdited(false);
            setDuration('30');
            setLocationType('');
            setHostName('Ayush Saha');
            setHostEmail('');
            setAccentColor('#8b5cf6');
            // Default schedule will be set after fetching schedules
        }
    };
    loadInit();
  }, [initialData, isOpen]);

  // Load Schedules
  useEffect(() => {
     if (!isOpen) return;
     const fetchScheds = async () => {
         try {
             // getAllSchedules returns array directly now
             const list = await scheduleService.getAllSchedules();
             setSchedules(list);
             
             // If not selected yet (and new event), select default
             if (!selectedScheduleId && (!initialData || !initialData.schedule_id)) {
                 const def = list.find(s => s.is_default);
                 if (def) setSelectedScheduleId(def.id);
                 else if (list.length > 0) setSelectedScheduleId(list[0].id);
             }
         } catch (e) {
             console.error("Failed to load schedules", e);
         }
     };
     fetchScheds();
  }, [isOpen]);

  // Load Schedule Detail when selected
  useEffect(() => {
      if (!selectedScheduleId) return;
      setScheduleDetail(null);
      const fetchDetail = async () => {
          try {
              const detail = await scheduleService.getScheduleById(selectedScheduleId);
              setScheduleDetail(detail);
          } catch(e) {
              console.error(e);
          }
      };
      fetchDetail();
  }, [selectedScheduleId]);

  // Auto-generate slug from title if not manually edited or existing
  useEffect(() => {
    // Enable auto-gen if it's a new event (no ID) and slug hasn't been manually edited
    const isNewEvent = !initialData || !initialData.id;
    if (isNewEvent && !isSlugEdited) {
        // Simple slug generation
        const generated = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        setSlug(generated);
    }
  }, [title, initialData, isSlugEdited]);

  const getWeeklyHoursPreview = () => {
      if (!scheduleDetail) return [];
      
      // Support both structure formats (flat DB array vs nested frontend state)
      const slotsData = scheduleDetail.availability || scheduleDetail.slots || [];
      
      const days = [
          { day: 'S', full: 'Sunday' },
          { day: 'M', full: 'Monday' },
          { day: 'T', full: 'Tuesday' },
          { day: 'W', full: 'Wednesday' },
          { day: 'T', full: 'Thursday' },
          { day: 'F', full: 'Friday' },
          { day: 'S', full: 'Saturday' }
      ];

      return days.map(d => {
          // Robust checking for day name matches
          const daySlots = slotsData.filter(s => {
              const sDay = s.day_of_week || s.day; // Handle both property names
              return sDay && sDay.toLowerCase() === d.full.toLowerCase();
          });
          const available = daySlots.length > 0;
          
          // Format slots for display
          const formattedSlots = daySlots.map(slot => {
              const formatTime = (t) => {
                  if (!t) return '';
                  // Parse HH:mm:ss or HH:mm
                  const [h, m] = t.toString().split(':');
                  const hour = parseInt(h);
                  const period = hour >= 12 ? 'pm' : 'am';
                  const hour12 = hour % 12 || 12; // 0 -> 12
                  return `${hour12}:${m}${period}`;
              };
              return `${formatTime(slot.start_time || slot.start)} - ${formatTime(slot.end_time || slot.end)}`;
          });
          
          return { day: d.day, label: d.full, available, slots: formattedSlots };
      });
  };
    
  const weeklyHours = getWeeklyHoursPreview();

const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const finalDuration = duration === 'custom' ? parseInt(customDuration) : parseInt(duration);
      
      // Use the slug from state directly. 
      // If empty, fallback to title-based slug logic (safeguard)
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const payload = {
        title,
        slug: finalSlug,
        duration: finalDuration || 30,
        location: locationType || 'Google Meet',
        host_name: hostName,
        host_email: hostEmail || 'ayush@example.com',
        description: `Meeting with ${hostName}`, 
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // availability: availabilitySlots, // Deprecated in favor of schedule_id
        schedule_id: selectedScheduleId,
        accent_color: accentColor
      };
      
      if (initialData && initialData.id) {
         // Update Mode
         await eventTypesService.updateEventType(initialData.id, payload);
         toast.success('Event type updated successfully!');
      } else {
         // Create Mode
         await eventTypesService.createEventType(payload);
         toast.success('Event type created successfully!');
      }
      
      if (onEventCreate) {
        onEventCreate();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save event type", error);
      toast.error(initialData ? 'Failed to update event type' : 'Failed to create event type');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };


  const content = (
      <div className={` flex flex-col overflow-hidden bg-white ${
          isModal 
            ? "rounded-xl shadow-xl w-full max-w-2xl h-full animate-in fade-in zoom-in duration-200 " 
            : "h-full w-full border-l border-gray-200"
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Event type</div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-4 h-4 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-1 ring-transparent hover:ring-gray-200"
                  style={{ backgroundColor: accentColor }}
                  title="Change event color"
                />
                
                {showColorPicker && (
                  <>
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowColorPicker(false)}
                    />
                    <div className="absolute top-6 left-0 z-50 bg-white p-3 rounded-lg shadow-xl border border-gray-100 w-[140px] grid grid-cols-5 gap-2 animate-in fade-in zoom-in duration-200">
                        {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => {
                                setAccentColor(color);
                                setShowColorPicker(false);
                            }}
                            className="w-5 h-5 rounded-full hover:scale-110 transition-transform relative group border border-gray-100"
                            style={{ backgroundColor: color }}
                        >
                            {accentColor === color && (
                                <Check size={12} className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-sm" />
                            )}
                        </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
              {isEditingTitle ? (
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  autoFocus
                  className="text-2xl font-bold text-gray-800 border-b border-blue-500 focus:outline-none"
                />
              ) : (
                <h2 
                  className="text-2xl font-bold text-gray-800 cursor-pointer hover:underline decoration-dashed dropdown-trigger"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title}
                </h2>
              )}
            </div>
            <div className="text-gray-500 text-sm mt-1 ml-7">One-on-One</div>
            <div className="ml-7 mt-2">
                 <label className="text-xs font-semibold text-gray-500 uppercase">Event Link</label>
                 <div className="flex items-center text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded border border-gray-200">
                     <span className="text-gray-400 select-none">{window.location.host}/ayushsaha1705/booking/</span>
                     <input 
                        type="text" 
                        value={slug} 
                        onChange={(e) => {
                            // Only allow lowercase alphanumeric and hyphens
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                            setSlug(val);
                            setIsSlugEdited(true);
                        }}
                        className="bg-transparent focus:outline-none flex-1 font-medium text-gray-800"
                     />
                 </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Duration Section */}
          <div className="border-b border-gray-100">
            <button 
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('duration')}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-800">Duration</h3>
                {!expandedSection === 'duration' && <span className="text-gray-500 text-sm font-normal">{duration} min</span>}
              </div>
              {expandedSection === 'duration' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            
            {expandedSection === 'duration' && (
              <div className="px-6 pb-6 pl-6">
                <div className="flex flex-wrap gap-3">
                  {['15', '30', '45', '60'].map((min) => (
                    <button
                      key={min}
                      onClick={() => { setDuration(min); setCustomDuration(''); }}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                        duration === min 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                  <div className="relative flex items-center">
                    <button
                        onClick={() => setDuration('custom')}
                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                            duration === 'custom'
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                    >
                        Custom
                    </button>
                    {duration === 'custom' && (
                        <div className="ml-2 flex items-center gap-2">
                             <input 
                                type="number" 
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                                className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="min"
                             />
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="border-b border-gray-100">
            <button 
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('location')}
            >
              <div className="flex items-center gap-3">
                 <h3 className="font-bold text-gray-800">Location</h3>
                 {locationType && <span className="text-sm font-normal text-gray-500 ml-2">{locationType}</span>}
              </div>
              {expandedSection === 'location' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {expandedSection === 'location' && (
              <div className="px-6 pb-6">
                 {/* Tip Box */}
                 <div className="bg-blue-50 rounded-md p-3 flex gap-3 mb-4">
                    <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        Tip: Meetings with locations are more likely to start on time!
                    </p>
                 </div>

                 {/* Location Tiles */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { id: 'zoom', label: 'Zoom', icon: Video },
                        { id: 'phone', label: 'Phone call', icon: Phone },
                        { id: 'person', label: 'In-person', icon: MapPinIcon },
                    ].map((loc) => (
                        <button
                            key={loc.id}
                            onClick={() => setLocationType(loc.label)}
                            className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-lg transition-all hover:shadow-md ${
                                locationType === loc.label
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700'
                            }`}
                        >
                            <loc.icon size={24} />
                            <span className="text-sm font-medium">{loc.label}</span>
                        </button>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div className="border-b border-gray-100">
             <button 
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('availability')}
            >
              <h3 className="font-bold text-gray-800">Availability</h3>
              {expandedSection === 'availability' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {expandedSection === 'availability' && (
                <div className="px-6 pb-6">
                    

                    {/* Schedule Settings */}
                    <div className="mb-4">
                         <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-bold text-gray-800">Schedule:</h4>
                            <div className="relative">
                                <select 
                                    value={selectedScheduleId || ''}
                                    onChange={(e) => setSelectedScheduleId(parseInt(e.target.value))}
                                    className="appearance-none bg-transparent font-semibold text-blue-600 hover:bg-blue-50 pl-2 pr-8 py-0.5 rounded cursor-pointer outline-none"
                                >
                                    {schedules.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.is_default ? '(Default)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none" />
                            </div>
                         </div>
                         
                         
                         
                    </div>

                         {/* Preview Box */}
                         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-sm text-gray-600 max-w-[80%]">
                                    {scheduleDetail ? `This event type uses the "${scheduleDetail.name}" schedule.` : 'Select a schedule.'}
                                </p>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                    <Globe size={14} />
                                    <span>Weekly hours</span>
                                </div>
                                <div className="space-y-3">
                                    {weeklyHours.map((day, idx) => (
                                        <div key={idx} className="flex items-start gap-4 text-sm">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                                                day.available ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                {day.day}
                                            </div>
                                            <div className="text-gray-600 flex-1">
                                                {day.available ? (
                                                    <div className="flex flex-col gap-1">
                                                        {day.slots.map((s, i) => <div key={i}>{s}</div>)}
                                                    </div>
                                                ) : 'Unavailable'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            
                         </div>
                   
                </div>
            )}
          </div>

          {/* Host Section */}
          <div className="border-b border-gray-100">
            <button 
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('host')}
            >
              <h3 className="font-bold text-gray-800">Host</h3>
              {expandedSection === 'host' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {expandedSection === 'host' && (
                <div className="px-6 pb-6">
                    {isEditingHost ? (
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                             <div>
                                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                                 <input 
                                    type="text" 
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                                 <input 
                                    type="email" 
                                    value={hostEmail}
                                    onChange={(e) => setHostEmail(e.target.value)}
                                    placeholder="Add email address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                 />
                             </div>
                             <button 
                                onClick={() => setIsEditingHost(false)}
                                className="text-sm text-blue-600 font-medium hover:underline"
                             >
                                 Done
                             </button>
                         </div>
                    ) : (
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                    {hostName.charAt(0)}
                                </div>
                                <div className="text-gray-700">
                                    {hostName} <span className="text-gray-500">(you)</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditingHost(true)}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
            <button 
                onClick={onClose}
                className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-blue-600 text-white font-medium px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create')}
            </button>
        </div>

      </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default CreateEventModal;
