import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { 
  HomeIcon, 
  StarIcon, 
  ClockIcon, 
  FolderIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowUpTrayIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

type Category = {
  id: string;
  name: string;
  slug: string;
};

// This would come from your Supabase database in a real app
const SAMPLE_CATEGORIES: Category[] = [
  { id: '1', name: 'Technology', slug: 'technology' },
  { id: '2', name: 'Finance', slug: 'finance' },
  { id: '3', name: 'Healthcare', slug: 'healthcare' },
  { id: '4', name: 'Retail', slug: 'retail' },
  { id: '5', name: 'Entertainment', slug: 'entertainment' },
  { id: '6', name: 'Social Media', slug: 'social-media' },
];

const Sidebar = () => {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [isOpen, setIsOpen] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  return (
    <aside className="w-64 bg-white h-screen overflow-y-auto flex flex-col sticky top-0 sm:sticky sm:top-0">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center">
          <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-2 text-xl font-semibold text-gray-900">VectorLogo</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/featured" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/featured') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <StarIcon className="h-5 w-5 mr-3" />
              <span>Featured</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/new" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/new') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ClockIcon className="h-5 w-5 mr-3" />
              <span>New Added</span>
            </Link>
          </li>
          
          {/* Categories with dropdown */}
          <li>
            <button 
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className={`flex items-center justify-between w-full p-2 rounded-md ${
                router.pathname.startsWith('/category') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 mr-3" />
                <span>Categories</span>
              </div>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  categoriesExpanded ? 'transform rotate-180' : ''
                }`} 
              />
            </button>
            
            {/* Categories submenu */}
            {categoriesExpanded && (
              <ul className="mt-2 ml-6 space-y-1">
                {SAMPLE_CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`}
                      className={`block p-2 rounded-md ${
                        router.asPath === `/category/${category.slug}` 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>
      
      {/* Authentication Links - Moved to bottom */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        {session ? (
          <div className="space-y-2">
            <Link 
              href="/upload" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/upload') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-3" />
              <span>Upload Logo</span>
            </Link>
            
            <Link 
              href="/profile" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/profile') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              <span>My Profile</span>
            </Link>
            
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="flex items-center p-2 rounded-md w-full text-left text-gray-700 hover:bg-gray-100"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link 
              href="/auth/signin" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/auth/signin') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              <span>Sign In</span>
            </Link>
            
            <Link 
              href="/auth/signup" 
              className={`flex items-center p-2 rounded-md ${
                isActive('/auth/signup') 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
