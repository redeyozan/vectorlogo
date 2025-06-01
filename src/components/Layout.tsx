import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'VectorLogo - Download Company Logos' }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);
  
  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Download high-quality company logos in SVG and PNG formats" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 relative">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-10 sm:hidden" />
          )}
          
          {/* Sidebar for mobile (fixed positioned) */}
          <div className={`sidebar fixed inset-y-0 left-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden border-r border-gray-200 shadow-sm`}>
            <div className="flex justify-end p-4 bg-white">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <Sidebar />
          </div>
          
          {/* Sidebar for desktop (static positioned with sticky) */}
          <div className="hidden sm:block sticky top-0 h-screen border-r border-gray-200 shadow-sm">
            <Sidebar />
          </div>
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="sticky top-0 z-30">
              <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            </div>
            <main className="flex-1 p-4 sm:p-6 bg-white overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
