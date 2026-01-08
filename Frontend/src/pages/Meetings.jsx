import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Download, 
  Filter, 
  Calendar, 
  Info 
} from 'lucide-react';

const Meetings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');

  return (
    <div className="p-4 md:p-8 w-full ">
       {/* Header */}
       <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
          <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle size={20} />
          </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-6">
            {/* My Calendly Dropdown */}
            <div className="relative">
                <button className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 hover:border-gray-400 bg-white">
                    My Calendly
                    <ChevronDown size={16} />
                </button>
            </div>
            
            {/* Show Buffers Toggle */}
            <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Show buffers</span>
                <Info size={16} className="text-gray-400" />
                <button className="w-8 h-4 bg-gray-300 rounded-full relative transition-colors">
                     <div className="w-4 h-4 bg-white rounded-full border border-gray-300 absolute left-0 top-0"></div>
                </button>
            </div>
        </div>

        <div className="text-gray-500 text-sm">
            Displaying 0 – 0 of 0 Events
        </div>
      </div>

      {/* Tabs and Actions Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[400px]">
          {/* Tabs Header */}
          <div className="flex flex-col md:flex-row justify-between border-b border-gray-200 px-4 md:px-6 pt-4">
              <div className="flex gap-6 overflow-x-auto">
                {['Upcoming', 'Past', 'Date Range'].map((tab) => (
                    <button
                        key={tab}
                        className={`pb-3 font-medium transition-colors relative whitespace-nowrap ${
                        activeTab === tab 
                            ? 'text-blue-600' 
                            : 'text-gray-600 hover:text-gray-900 md:hover:text-blue-600'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'Date Range' ? (
                             <span className="flex items-center gap-1">
                                Date Range <ChevronDown size={14} />
                             </span>
                        ) : tab}
                        {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                        )}
                    </button>
                ))}
              </div>

               <div className="flex items-center gap-3 pb-3 md:pb-2 mt-2 md:mt-0">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50">
                        <Filter size={16} />
                        Filter
                        <ChevronDown size={14} />
                    </button>
               </div>
          </div>

          {/* Empty State Content */}
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
             <div className="relative mb-6">
                <Calendar size={64} className="text-gray-200" strokeWidth={1} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
                    0
                </div>
             </div>
             
             <h3 className="text-xl font-bold text-gray-800 mb-2">No Events Yet</h3>
             <p className="text-gray-500 mb-6 max-w-sm">
                Share Event Type links to schedule events.
             </p>
             
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-full transition-colors">
                 View Event Types
             </button>
          </div>
      </div>
    </div>
  );
};

export default Meetings;
