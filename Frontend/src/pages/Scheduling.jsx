import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Link as LinkIcon, 
  MoreHorizontal, 
  ExternalLink, 
  Plus, 
  HelpCircle, 
  ChevronDown,
  Copy,
  Trash2,
  X,
  Eye
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CreateEventModal from '../components/CreateEventModal';
import eventTypesService from '../services/eventTypes.service';

const Scheduling = () => {
  const [activeTab, setActiveTab] = useState('Event types');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dropdown State
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);


  const fetchEventTypes = async () => {
    try {
      const data = await eventTypesService.getAllEventTypes();
      setEventTypes(data);
    } catch (error) {
      console.error("Failed to fetch event types", error);
      toast.error("Failed to load event types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEventCreated = () => {
    fetchEventTypes();
    setIsModalOpen(false);
    setSelectedEvent(null);
  };
  
  const handleCopyLink = (e, event) => {
    e.stopPropagation();
    const username = "ayushsaha1705"; // Hardcoded as per request
    const url = `${window.location.origin}/${username}/booking/${event.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleViewBooking = (e, event) => {
    e.stopPropagation();
    const username = "ayushsaha1705";
    const url = `${window.location.origin}/${username}/booking/${event.slug}`;
    window.open(url, '_blank');
    setActiveDropdownId(null);
  };

  const handleDuplicate = (e, event) => {
    e.stopPropagation();
    // Clone logic: pass data without ID, modify title and slug
    const clonedEvent = {
        ...event,
        id: undefined, // Ensure it's treated as new
        title: `${event.title} (Clone)`,
        slug: '' // Let user/modal generate new slug or auto-generate
    };
    setSelectedEvent(clonedEvent);
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleDeleteOne = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event type?')) return;
    
    try {
        await eventTypesService.deleteEventType(id);
        toast.success('Event type deleted');
        fetchEventTypes();
    } catch (error) {
        console.error(error);
        toast.error('Failed to delete event type');
    }
    setActiveDropdownId(null);
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const toggleSelection = (e, id) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

 const handleEditEvent = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} event type(s)?`)) return;

    try {
        setIsDeleting(true);
        // Execute all deletes in parallel
        await Promise.all(
            Array.from(selectedIds).map(id => eventTypesService.deleteEventType(id))
        );
        
        toast.success(`Deleted ${selectedIds.size} event type(s)`);
        setSelectedIds(new Set());
        fetchEventTypes();
    } catch (error) {
        console.error("Failed to delete events", error);
        toast.error("Failed to delete some events");
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full relative ">
      <Toaster position="top-center" />
      {/* Main Content Area */}
      <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isModalOpen ? 'mr-0' : 'w-full'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-800">Scheduling</h1>
           {/* Help Icon */}
           <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle size={20} />
          </button>
        </div>
        <button 
          onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create
          {/* <ChevronDown size={16} className="ml-1" /> */}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        {['Event types', 'Single-use links', 'Meeting polls'].map((tab) => (
          <button
            key={tab}
            className={`pb-4 font-medium transition-colors relative ${
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

      {/* Search Bar */}
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search event types"
          className="pl-10 pr-4 py-3 w-full md:w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 shadow-sm"
        />
      </div>

      {/* User Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            A
          </div>
          <span className="font-medium text-gray-700">Ayush Saha</span>
          <a href="#" className="flex items-center gap-1 text-blue-600 text-sm hover:underline ml-2">
            <ExternalLink size={14} />
            View landing page
          </a>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Event Types List */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10 text-gray-500">Loading events...</div>
        ) : eventTypes.length === 0 ? (
           <div className="text-center py-10 text-gray-500">No event types found. Create one to get started!</div>
        ) : (
          eventTypes.map((event) => (
          <div 
            key={event.id} 
            onClick={(e) => handleEditEvent(event, e)}
            className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative"
          >
            {/* Colored Indicator Line */}
            <div className={`w-2 md:w-1.5 self-stretch bg-purple-600 md:rounded-l-lg`}></div> 


             {/* Checkbox */}
             <div className="pt-6 pl-4 md:self-center md:pt-0">
                 <input 
                    type="checkbox" 
                    checked={selectedIds.has(event.id)}
                    onChange={(e) => toggleSelection(e, event.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                 />
             </div>

            {/* Content */}
            <div className="flex-1 p-5 md:p-6 ml-2">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{event.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <span>{event.duration} min</span>
                        <span>•</span>
                        <span>{event.location || 'No Location'}</span>
                        <span>•</span>
                        <span>One-on-One</span>
                    </div>
                     <div className="text-gray-500 text-sm mt-2">
                        View availability details
                     </div>
                  </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-5 md:p-6 flex items-center border-t md:border-t-0 md:border-l border-gray-100 gap-3">
                <button 
                    onClick={(e) => handleCopyLink(e, event)}
                    className="flex items-center gap-2 text-blue-600 border border-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                    <LinkIcon size={16} />
                    Copy link
                </button>
                
                <div className="relative">
                     <button 
                        onClick={(e) => toggleDropdown(e, event.id)}
                        className={`text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 ${activeDropdownId === event.id ? 'bg-gray-100 text-gray-600' : ''}`}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {activeDropdownId === event.id && (
                        <div 
                            ref={dropdownRef}
                            className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom-right"
                            onClick={(e) => e.stopPropagation()}
                        >
                             <button 
                                onClick={(e) => handleEditEvent(event, e)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <span>Edit</span>
                            </button>
                            <button 
                                onClick={(e) => handleDuplicate(e, event)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <span>Duplicate</span>
                            </button>
                            <button 
                                onClick={(e) => handleViewBooking(e, event)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <span>View booking page</span>
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                                onClick={(e) => handleDeleteOne(e, event.id)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>

        )))}
      </div>
      
     </div>

      {/* Side Panel */}
      {isModalOpen && (
         <div className=" w-[480px] border-l border-gray-200 bg-white h-screen overflow-y-auto sticky top-0 shadow-xl z-20 shrink-0 animate-in slide-in-from-right duration-300">
            <CreateEventModal 
                isOpen={true} 
                onClose={() => setIsModalOpen(false)} 
                onEventCreate={handleEventCreated}
                isModal={false}
                initialData={selectedEvent}
            />
         </div>
      )}

       {/* Floating Delete Bar */}
       {selectedIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-4 rounded-full shadow-2xl border border-gray-200 z-50 flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300">
             <div className="flex items-center gap-4">
                 <div className="bg-gray-100 rounded-lg px-3 py-1 font-semibold text-sm">
                    {selectedIds.size} selected
                 </div>
                 <span className="text-gray-400">|</span>
                 <button 
                   onClick={() => setSelectedIds(new Set())}
                   className="text-gray-500 hover:text-gray-800 text-sm font-medium"
                 >
                    Unselect all
                 </button>
             </div>
             
             <button 
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
             >
                {isDeleting ? 'Deleting...' : (
                    <>
                        <Trash2 size={16} />
                        Delete
                    </>
                )}
             </button>
             
             <button 
                onClick={() => setSelectedIds(new Set())}
                className="absolute -top-2 -right-2 bg-gray-200 text-gray-600 rounded-full p-1 hover:bg-gray-300"
             >
                 <X size={14} />
             </button>
          </div>
       )}

    </div>
  );
};

export default Scheduling;
