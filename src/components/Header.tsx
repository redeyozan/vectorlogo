import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser, useSession } from '@supabase/auth-helpers-react';
import { MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Header = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/logos',
      query: { 
        search: searchQuery,
        format: selectedFormat !== 'all' ? selectedFormat : undefined
      }
    });
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0">
        <div className="flex justify-between h-16 items-center gap-2 px-4 w-full">
          {/* Mobile Hamburger Menu */}
          <div className="flex-shrink-0 sm:hidden">
            <button 
              onClick={() => toggleSidebar && toggleSidebar()}
              className="sidebar-toggle p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 mx-4 hidden sm:flex w-full max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="flex items-center w-full">
                <div className="relative flex-grow w-full">
                  <input
                    type="text"
                    placeholder="Search logos..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  
                  {/* Format Selector Dropdown */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <select
                      className="appearance-none bg-white border-0 text-gray-500 text-sm font-medium focus:outline-none focus:ring-0 pr-6"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="all">All Formats</option>
                      <option value="svg">SVG</option>
                      <option value="png">PNG</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Search Icon for Mobile */}
          <div className="flex-1 sm:hidden">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search logos..."
                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none pl-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* User menu - Only shown when logged in */}
          {user && (
            <div className="ml-4 flex items-center">
              <Popover className="relative">
                <Popover.Button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user.email}
                    </div>
                    <Link 
                      href="/admin/logos" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      href="/upload" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Upload Logo
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </Popover.Panel>
                </Transition>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
