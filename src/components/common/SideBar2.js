"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Folder, FileText, ChevronRight } from 'lucide-react';

const Sidebar = ({ onClose, isMobile, onStatusChange, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: Home, text: 'Home', section: 'home' },
    { icon: Folder, text: 'Ordner', section: 'folder' },
    {
      icon: FileText,
      text: 'Meine Projekte',
      subItems: [
        { text: 'in Bearbeitung', status: 'inBearbeitung' },
        { text: 'Genehmigt', status: 'genehmigt' },
        { text: 'Abgelehnt', status: 'abgelehnt' },
      ],
    },
  ];

  const handleItemClick = (item) => {
    if (item.subItems) {
      setExpandedItem(expandedItem === item.text ? null : item.text);
    } else if (item.section) {
      onSectionChange(item.section); // Change section to dashboard
      if (isMobile) {
        onClose();
      }
    }
  };

  const handleStatusClick = (status) => {
    onStatusChange(status);
    onSectionChange('projects'); // Redirect to projects section
    if (isMobile) {
      onClose();
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 md:w-16'}`}>
      <nav className="mt-20 flex flex-col justify-between h-[calc(100%-4rem)]">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.text}>
              <div
                onClick={() => handleItemClick(item)}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-600" />
                <span className={`text-sm font-medium ${isOpen ? 'block' : 'hidden md:hidden'}`}>{item.text}</span>
                {item.subItems && isOpen && (
                  <ChevronRight className={`ml-auto transition-transform ${expandedItem === item.text ? 'rotate-90' : ''}`} />
                )}
              </div>
              {item.subItems && isOpen && expandedItem === item.text && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.text}>
                      <a
                        onClick={() => handleStatusClick(subItem.status)}
                        className="flex items-center px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                      >
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
