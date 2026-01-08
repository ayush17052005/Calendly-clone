import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Download, 
  Filter, 
  Calendar, 
  Info,
  ChevronUp,
  ExternalLink,
  MapPin,
  User,
  MoreHorizontal,
  FileText,
  Trash2,
  Edit,
  Flag
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import bookingsService from '../services/bookings.service';
import eventTypesService from '../services/eventTypes.service';

const Meetings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // Date Range Filter State
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchMeetings = async () => {
      setLoading(true);
      try {
          // Map tab to backend filter type
          let type = activeTab;
          if (activeTab === 'date_range') type = 'range';

          const filters = { type, startDate: dateRange.start, endDate: dateRange.end };
          const data = await bookingsService.getAllBookings(filters);
          console.log("Fetched meetings:", data);
          setMeetings(data);
      } catch (error) {
          console.error(error);
          toast.error("Failed to load meetings");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchMeetings();
      
  }, [activeTab]); // Refetch when tab changes. For range, we might want a manual apply button or effect on dates.

  // Group meetings by Date for the header
  const groupedMeetings = meetings.reduce((groups, meeting) => {
      const dateKey = new Date(meeting.start_time).toLocaleDateString('en-GB', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
      });
      if (!groups[dateKey]) {
          groups[dateKey] = [];
      }
      groups[dateKey].push(meeting);
      return groups;
  }, {});

  const toggleExpand = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  const handleCancel = async (id) => {
      if(!window.confirm("Are you sure you want to delete this meeting?")) return;
      try {
          await bookingsService.deleteBooking(id);
          toast.success("Meeting deleted");
          fetchMeetings();
      } catch (e) {
          toast.error("Failed to delete");
      }
  };

  const formatTimeRange = (start, end) => {
      // Ensure we treat the input as UTC if it lacks a timezone offset,
      // because we store it as 'YYYY-MM-DD HH:mm:ss' (UTC) in DB.
      // If start is "2026-01-09 09:30:00", new Date(start) treats it as local.
      // We want to force it to be treated as UTC so it converts to local correctly.
      
      const toDate = (dateStr) => {
          if (!dateStr) return new Date();
          // If input is 'YYYY-MM-DD HH:mm:ss', treat it as local time (or "floating" time)
          const isoLike = dateStr.replace(' ', 'T');
          return new Date(isoLike);
      };

      const s = toDate(start);
      const e = toDate(end);
      
      return `${s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – ${e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div className="p-4 md:p-8 w-full mx-auto">
       <Toaster position="top-center" />
       
       {/* Header */}
       <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
          <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle size={20} />
          </button>
      </div>

      {/* Controls Bar & Tabs */}
      <div className="border-b border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
          
          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto">
            {['upcoming', 'past', 'date_range'].map((tab) => (
            <button
                key={tab}
                className={`pb-4 font-medium transition-colors capitalize whitespace-nowrap relative ${
                activeTab === tab 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab)}
            >
                {tab === 'date_range' ? 'Date Range' : tab}
                {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                )}
            </button>
            ))}
         </div>

         <div className="pb-2 flex items-center gap-2">
            <button className="text-gray-600 text-sm font-medium flex items-center gap-1 hover:text-blue-600">
                Export <Download size={14} />
            </button>
         </div>
      </div>

      {/* Date Range Picker (Conditional) */}
      {activeTab === 'date_range' && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-end gap-4 border border-gray-200">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                  <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="px-3 py-2 border rounded text-sm" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                  <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="px-3 py-2 border rounded text-sm" />
              </div>
              <button 
                onClick={fetchMeetings}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
                Apply
            </button>
          </div>
      )}

      {/* Meetings List */}
      {loading ? (
          <div className="text-center py-10 text-gray-500">Loading meetings...</div>
      ) : Object.keys(groupedMeetings).length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No scheduled events</h3>
              <p className="text-gray-500">You have no {activeTab} events scheduled.</p>
          </div>
      ) : (
          <div className="space-y-8">
              {Object.entries(groupedMeetings).map(([dateLabel, dayMeetings]) => (
                  <div key={dateLabel}>
                      {/* Date Header */}
                      <div className="bg-gray-50/50 border-b border-gray-200 py-2 px-4 mb-2 text-sm font-semibold text-gray-600 sticky top-0 z-10 backdrop-blur-sm">
                          {dateLabel}
                      </div>

                      <div className="space-y-2">
                          {dayMeetings.map(meeting => (
                              <div key={meeting.id} className="group bg-white border border-transparent hover:border-gray-200 hover:shadow-sm rounded-lg transition-all">
                                  {/* Summary Row */}
                                  <div 
                                    className="flex flex-col md:flex-row md:items-center p-4 gap-4 cursor-pointer"
                                    onClick={() => toggleExpand(meeting.id)}
                                  >
                                      {/* Color Dot & Time */}
                                      <div className="flex items-center gap-4 w-full md:w-1/4">
                                          <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></div>
                                          <span className="text-gray-900 font-medium">
                                              {formatTimeRange(meeting.start_time, meeting.end_time)}
                                          </span>
                                      </div>

                                      {/* Invitee Summary */}
                                      <div className="w-full md:w-1/4 text-sm text-gray-600 font-medium">
                                          {meeting.booker_name}
                                          <span className="text-gray-400 font-normal ml-1">(Invitee)</span>
                                      </div>

                                      {/* Event Type */}
                                      <div className="w-full md:w-1/4 text-sm font-bold text-gray-800">
                                          {meeting.event_title}
                                      </div>
                                      
                                      {/* Expand Button */}
                                      <div className="ml-auto">
                                           <button className="text-gray-400 hover:text-blue-600 flex items-center gap-1 text-sm border px-3 py-1 rounded bg-white hover:bg-gray-50 transition-colors">
                                               Details
                                               {expandedId === meeting.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                           </button>
                                      </div>
                                  </div>

                                  {/* Expanded Details */}
                                  {expandedId === meeting.id && (
                                      <div className="border-t border-gray-100 p-6 flex flex-col md:flex-row gap-8 bg-gray-50/30">
                                          
                                          {/* Left Actions Column */}
                                          <div className="w-full md:w-64 space-y-3 flex flex-col">
                                              <button className="flex items-center gap-2 justify-center w-full py-2 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors">
                                                 <Edit size={14} /> Edit Invitee Limit
                                              </button>
                                              <button className="flex items-center gap-2 justify-center w-full py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-white transition-colors">
                                                 <Download size={14} /> Export
                                              </button>
                                              <button 
                                                onClick={() => handleCancel(meeting.id)}
                                                className="flex items-center gap-2 justify-center w-full py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-white hover:text-red-600 transition-colors"
                                              >
                                                 <Trash2 size={14} /> Delete
                                              </button>

                                              <div className="pt-4 space-y-3">
                                                  <button className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                                                      <ExternalLink size={14} /> Edit Event Type
                                                  </button>
                                                  <button className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                                                      <Filter size={14} /> Filter by Event Type
                                                  </button>
                                                  <button className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                                                      <Flag size={14} /> Report this event
                                                  </button>
                                              </div>
                                          </div>

                                          {/* Right Info Column */}
                                          <div className="flex-1 space-y-8">
                                              {/* Location */}
                                              <div>
                                                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Location</h4>
                                                  <p className="text-gray-800 text-sm flex items-center gap-2">
                                                      {meeting.location?.includes('Meet') ? <MapPin size={16}/> : <MapPin size={16}/> }
                                                      {meeting.location || 'Google Meet'}
                                                  </p>
                                              </div>

                                              {/* Host */}
                                              <div>
                                                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Meeting Host</h4>
                                                  <p className="text-gray-600 text-sm mb-2">Host will attend this meeting</p>
                                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs">
                                                      A
                                                  </div>
                                              </div>

                                              {/* Invitees List */}
                                              <div>
                                                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 border-b border-gray-200 pb-2">
                                                      Invitees
                                                  </h4>
                                                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                      <div className="flex items-center gap-3">
                                                           <User size={16} className="text-gray-800" />
                                                           <span className="font-bold text-sm text-gray-800">{meeting.booker_name}</span>
                                                      </div>
                                                      <div className="text-sm text-gray-500 flex items-center gap-2 cursor-pointer hover:text-blue-600">
                                                          Invitee details <ChevronRightIcon />
                                                      </div>
                                                  </div>
                                                  <div className="text-xs text-gray-400 mt-2">
                                                      {meeting.booker_email}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

// Helper Icon
const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

export default Meetings;
           