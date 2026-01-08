import React from 'react';
import { 
  Plus, 
  HelpCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';

const Contacts = () => {
  return (
      <div className="p-4 md:p-8 w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors">
                <Plus size={20} />
                Add contact
            </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left Content */}
            <div className="flex-1 max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Stay organized as you build relationships</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Contacts are automatically created and updated when a Calendly meeting is booked. 
                    View meeting history, access key details, and schedule your next conversation — all in one place.
                </p>
                <a href="#" className="flex items-center gap-1 text-blue-600 hover:underline font-medium mb-8">
                    <HelpCircle size={16} />
                    Learn more
                    <ChevronRight size={16} />
                </a>

                <div className="flex flex-wrap gap-4">
                     <button className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-5 py-2.5 rounded-full transition-colors">
                        <Plus size={18} />
                        Add contact
                    </button>
                     <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-full transition-colors">
                        <Calendar size={18} />
                        Book your first meeting
                    </button>
                </div>
            </div>

            {/* Right Illustration (Mock Table) */}
            <div className="flex-1 w-full max-w-xl">
                 <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden relative">
                    {/* Decorative Blob */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl z-0"></div>

                     {/* Table Header */}
                    <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 p-4 text-xs font-bold text-gray-500 uppercase z-10 relative">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Job title</div>
                    </div>

                    {[
                        { name: 'Daniel Jones', email: 'daniel@magnolia.com', job: 'Account Manager', img: 'https://i.pravatar.cc/150?u=1' },
                        { name: 'Kathryn Irving', email: 'kathryn@magnolia.com', job: 'Senior Designer', img: 'https://i.pravatar.cc/150?u=2' },
                        { name: 'Miguel Padilla', email: 'miguel@wooly.com', job: 'Marketing Lead', img: 'https://i.pravatar.cc/150?u=3' },
                        { name: 'Michael Mendez', email: 'michael@wooly.com', job: 'Customer Success', img: 'https://i.pravatar.cc/150?u=4' },
                    ].map((person, idx) => (
                        <div key={idx} className="grid grid-cols-3 p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-default text-sm font-medium items-center relative z-10 bg-white/80 backdrop-blur-sm">
                             <div className="flex items-center gap-3 text-gray-800">
                                 <img src={person.img} alt={person.name} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                 {person.name}
                             </div>
                             <div className="text-gray-600 truncate pr-2">{person.email}</div>
                             <div className="text-gray-500 truncate">{person.job}</div>
                        </div>
                    ))}
                    
                    {/* Fade overlay at bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
                 </div>
            </div>
        </div>
      </div>
  );
};

export default Contacts;
