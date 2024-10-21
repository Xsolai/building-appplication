import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, ChevronDown, Info, DollarSign, BookOpen, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import logo from "@/assests/images/logo.svg"

const AppBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false); // State for settings dropdown

  const userData = {
    name: "John Doe",
    email: "john.doe@example.com"
  };

const [isOpen, setIsOpen] = useState(false);

// Mock notification data
const notifications = [
  { id: 1, message: 'New message from John', time: '2 mins ago' },
  { id: 2, message: 'Your order is ready for pickup', time: '1 hour ago' },
  { id: 3, message: 'New comment on your post', time: '3 hours ago' },
];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleSettingsMenu = () => setShowSettingsMenu(!showSettingsMenu); // Toggle settings dropdown

  const menuItems = [
    { title: 'Über uns', href: '/uberuns', icon: Info },
    { title: 'Preismodell', href: '/preismodell', icon: DollarSign },
    { title: 'Hilfe', href: '/hilfe', icon: BookOpen },
    { title: 'Support', href: '/support', icon: HelpCircle },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-20 bg-white transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-14 w-auto" src={logo.src} alt="BauantragDE Logo" />
            </div>
            <div className="hidden md:flex md:flex-grow md:justify-center">
              {menuItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 inline-flex items-center px-3 py-2 text-base font-medium border-b-2 border-transparent transition-colors duration-200"
                >
                  {item.title}
                  <ChevronDown className="ml-1 h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="relative flex space-x-4">
              <button
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                onClick={toggleDropdown}
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Notification Dropdown */}
              {isOpen && (
                <div className="absolute right-0 w-64 mt-10 py-2 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-700">
                    Notifications
                  </div>

                  {/* Notifications List */}
                  <ul className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <li key={notification.id} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <p className="text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">No new notifications</li>
                    )}
                  </ul>

                  {/* View All Link */}
                  <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
                    View all notifications
                  </div>
                </div>
              )}
            

              
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <User className="h-8 w-8 rounded-full bg-gray-400 p- border border-gray-300" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 w-64 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                  <div classname="relative" > 
                  <button onClick={toggleSettingsMenu} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                  Einstellungen
                  </button>
                  {showSettingsMenu && (
                    <div className="absolute right-0 mt-2 py-2  bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <a href="/accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Kontoeinstellungen</a>
                      <a href="/privacy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Datenschutzeinstellungen</a>
                    </div>
                  )}
                  </div>
                    <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Abmelden</a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        <div className="h-px bg-black"></div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden" style={{top: '65px'}}>
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block pl-3 pr-4 py-2 text-base font-medium border-l-4 border-transparent hover:border-gray-300 transition-colors duration-200"
              >
                <item.icon className="inline-block mr-2 h-5 w-5" />
                {item.title}
                <ChevronDown className="float-right mt-1 h-5 w-5" />
              </a>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <button 
              onClick={toggleUserMenu}
              className="flex items-center w-full px-4 py-2 text-left"
            >
              <div className="flex-shrink-0">
                <User className="h-10 w-10 rounded-full bg-gray-400 p-1 border border-gray-300" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{userData.name}</div>
                <div className="text-sm font-medium text-gray-500">{userData.email}</div>
              </div>
              <ChevronDown className="ml-auto h-5 w-5 text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="mt-3 space-y-1">
                <a href="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Profil</a>
                <button onClick={toggleSettingsMenu} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ">
                  Einstellungen
                  </button>
                  {showSettingsMenu && (
                    <div className="absolute right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <a href="/accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Kontoeinstellungen</a>
                      <a href="/privacy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Datenschutzeinstellungen</a>
                    </div>
                  )}
                <a href="/" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Abmelden</a>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
};

export default AppBar;
