"use client";
import { useState, useEffect } from 'react';
import { Menu, X, Home, Folder, FileText, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { 
      icon: Home, 
      text: 'Dashboard', 
      href: '/dashboard'
    },
    { 
      icon: Folder, 
      text: 'Ordner', 
      href: '/dashboard'
    },
    {
      icon: FileText,
      text: 'Meine Projekte',
      href: '/dashboard',
      subItems: [
        { text: 'In Bearbeitung', href: '/dashboard' },
        { text: 'Genehmigt', href: '/dashboard' },
        { text: 'Abgelehnt', href: '/dashboard' },
      ],
    },
  ];

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0 overflow-hidden'} z-20` }>
      <nav className="mt-20 flex flex-col justify-between h-[calc(100%-4rem)]">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.text}>
              <Link
                href={item.href}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">{item.text}</span>
              </Link>
              {item.subItems && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={`${item.text}-${subIndex}`}>
                      <Link
                        href={subItem.href}
                        className="flex items-center px-4 py-1 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
                        {subItem.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {isMobile && mounted && (
          <button
            onClick={onClose}
            className="mb-6 mx-4 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <X size={20} className="mr-2" />
            Menü schließen
          </button>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;