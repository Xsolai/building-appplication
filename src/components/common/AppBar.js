import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, ChevronDown, Info, DollarSign, BookOpen, HelpCircle } from 'lucide-react';
import logo from "@/assests/images/logo.svg";
import { useRouter } from 'next/navigation';

const AppBar = () => {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: ''
  });

  const notifications = [
    { id: 1, message: 'New message from John', time: '2 mins ago' },
    { id: 2, message: 'Your order is ready for pickup', time: '1 hour ago' },
    { id: 3, message: 'New comment on your post', time: '3 hours ago' },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch("https://app.saincube.com/app1/update-profile", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData({
          username: data.username || '',
          email: data.email || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

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
              <div className="menu-container">
                <button
                  className="p-1 rounded-full my-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu('notifications');
                  }}
                >
                  <Bell className="h-6 w-6 " />
                </button>

                {activeMenu === 'notifications' && (
                  <div className="absolute right-0 w-64 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-700">
                      Notifications
                    </div>
                    <ul className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <li key={notification.id} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <p className="text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="menu-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu('profile');
                  }}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 my-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <User className="h-8 w-8 rounded-full bg-gray-400 p-0.5 border border-gray-300" />
                </button>

                {activeMenu === 'profile' && (
                  <div className="absolute right-0 w-64 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userData.username}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu('settings');
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Einstellungen
                    </button>
                    {activeMenu === 'settings' && (
                      <div className="absolute right-full mr-2 top-0 w-48 py-2 bg-white border border-gray-200 rounded-md shadow-lg">
                        <a href="/accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Kontoeinstellungen</a>
                        <a href="/privacy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Datenschutzeinstellungen</a>
                      </div>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center md:hidden menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu('mobile');
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                >
                  {activeMenu === 'mobile' ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-black"></div>
      </nav>

      {activeMenu === 'mobile' && (
        <div className="fixed inset-0 z-40 bg-white md:hidden" style={{top: '65px'}}>
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block pl-3 pr-4 py-2 text-base font-medium border-l-4 border-transparent hover:border-gray-300"
              >
                <item.icon className="inline-block mr-2 h-5 w-5" />
                {item.title}
                <ChevronDown className="float-right mt-1 h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AppBar;