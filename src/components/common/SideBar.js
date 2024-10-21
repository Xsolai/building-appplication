"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Folder, FileText, ChevronRight, User } from 'lucide-react';

const Sidebar = ({ onClose, isMobile }) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: Home, text: 'Home', href: '/dashboard' },
    { icon: Folder, text: 'Ordner' },
    {
      icon: FileText,
      text: 'Meine Projekte',
      subItems: [
        { text: 'in Bearbeitung' },
        { text: 'Genehmigt' },
        { text: 'Abgelehnt' },
      ],
    },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 md:w-16'}`}>
      <nav className="mt-20 flex flex-col justify-between h-[calc(100%-4rem)]">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={item.text}>
              <a href={item.href} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                <item.icon className="w-5 h-5 mr-3 text-gray-600" />
                <span className={`text-sm font-medium ${isOpen ? 'block' : 'hidden md:hidden'}`}>{item.text}</span>
              </a>
              {item.subItems && isOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <a href="#" className="flex items-center px-4 py-1 text-sm text-gray-600 hover:bg-gray-100">
                        <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
                        {subItem.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {isMobile && (
          <button
            onClick={() => {
              setIsOpen(false);
              onClose();
            }}
            className="mb-6 mx-4 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <X size={20} className="mr-2" />
            Close Menu
          </button>
        )}
      </nav>
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 right-4 p-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full transition-colors duration-200"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
    </div>
  );
};

export default Sidebar;