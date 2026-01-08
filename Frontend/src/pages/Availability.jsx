import React, { useState } from 'react';
import { 
  ChevronDown, 
  List, 
  Calendar as CalendarIcon, 
  MoreVertical, 
  Plus,
  Trash2,
  Copy,
  Info,
  Globe
} from 'lucide-react';

const Availability = () => {
  const [activeTab, setActiveTab] = useState('Schedules');
  
  const weeklyHours = [
      { day: 'S', dayFull: 'Sunday', available: false },
      { day: 'M', dayFull: 'Monday', available: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
      { day: 'T', dayFull: 'Tuesday', available: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
      { day: 'W', dayFull: 'Wednesday', available: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
      { day: 'T', dayFull: 'Thursday', available: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
      { day: 'F', dayFull: 'Friday', available: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
      { day: 'S', dayFull: 'Saturday', available: false }, // Screenshot shows S is active with hours? Wait, user mentioned S (Sun) and S (Sat) are different. Let's assume standard Mon-Fri work week based on typical defaults, but based on screenshot request I should look closer. 
      // Re-checking description: "S (Sunday): ... Unavailable... S (Saturday): Dark circle S, Input 9:00am - 5:00pm". Okay, Sat is active, Sun is not.
  ];

  // Adjusting for the specific screenshot details mentioned in thought process
  const scheduleData = [
    { day: 'S', label: 'Sun', available: false },
    { day: 'M', label: 'Mon', available: true },
    { day: 'T', label: 'Tue', available: true },
    { day: 'W', label: 'Wed', available: true },
    { day: 'T', label: 'Thu', available: true },
    { day: 'F', label: 'Fri', available: true },
    { day: 'S', label: 'Sat', available: true },
  ];

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl">
       <h1 className="text-3xl font-bold text-gray-800 mb-6">Availability</h1>

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
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-blue-600 cursor-pointer hover:underline">Working hours (default)</h2>
                      <ChevronDown size={20} className="text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:underline">
                      <span>Active on: <span className="font-semibold">1 event type</span></span>
                      <ChevronDown size={14} />
                  </div>
              </div>

              <div className="flex items-center bg-gray-100 p-1 rounded-md">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded shadow-sm text-gray-700 text-sm font-medium">
                      <List size={16} />
                      List
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                      <CalendarIcon size={16} />
                      Calendar
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                   <button className="p-1.5 text-gray-500 hover:text-gray-700">
                      <MoreVertical size={16} />
                  </button>
              </div>
          </div>

          {/* Card Body - Grid Layout */}
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
                                  <button className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors uppercase ${item.available ? 'bg-gray-100 text-gray-900 border border-gray-300' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                      {item.day}
                                  </button>
                              </div>

                              {/* Hours Input or Unavailable */}
                              <div className="flex-1 pt-1">
                                  {!item.available ? (
                                      <div className="flex items-center gap-3 h-10">
                                          <span className="text-gray-500 text-sm">Unavailable</span>
                                          <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                              <Plus size={18} />
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2 flex-wrap">
                                          <div className="flex items-center gap-2">
                                              <input type="text" defaultValue="9:00am" className="w-24 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                              <span className="text-gray-400">-</span>
                                              <input type="text" defaultValue="5:00pm" className="w-24 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                          </div>
                                          <div className="flex items-center gap-1 ml-2">
                                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                                  <Trash2 size={18} />
                                              </button>
                                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                                  <Plus size={18} />
                                              </button>
                                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                                  <Copy size={18} />
                                              </button>
                                          </div>
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
                  
                  <button className="flex items-center gap-2 text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full text-sm font-medium transition-colors w-full justify-center md:w-auto">
                    <Plus size={16} />
                    Hours
                  </button>
              </div>
          </div>
          
           {/* Card Footer */}
           <div className="p-6 border-t border-gray-200">
                <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                    <Globe size={16} />
                    India Standard Time
                    <ChevronDown size={14} />
                </button>
           </div>
      </div>
    </div>
  );
};

export default Availability;
