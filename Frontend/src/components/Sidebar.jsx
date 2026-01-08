import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Plus, 
  Link as LinkIcon, 
  Calendar, 
  Clock, 
  Users, 
  HelpCircle, 
  User,
  X // Close icon for mobile
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Scheduling', path: '/scheduling', icon: <LinkIcon size={20} /> },
    { name: 'Meetings', path: '/meetings', icon: <Calendar size={20} /> },
    { name: 'Availability', path: '/availability', icon: <Clock size={20} /> },
    // { name: 'Contacts', path: '/contacts', icon: <Users size={20} /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col h-full
        `}
      >
        {/* Logo Section */}
        <div className="p-4 flex items-center justify-between">
            {/* Find a nice logo placeholder or text */}
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">C</div>
             <span className="text-xl font-bold text-gray-800">Calendly</span>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Create Button */}
        <div className="px-4 pb-4">
          <button className="w-full bg-white border-[1px] border-blue-700 hover:bg-blue-700 text-blue-700 rounded-full py-2.5 px-4 flex items-center justify-center gap-2 font-medium shadow-sm transition-colors">
            <Plus size={20} />
            Create
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose && window.innerWidth < 768 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <ul className="space-y-1">

             <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <User size={20} />
                Account
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <HelpCircle size={20} />
                Help
              </a>
            </li>
           
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
