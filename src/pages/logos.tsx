import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAllLogos, getLogosByCategory, Logo, searchLogos } from '../lib/logoService';
import Layout from '../components/Layout';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LogosPageProps {
  initialLogos: Logo[];
  categories: string[];
  searchQuery?: string;
  formatFilter?: string;
}

export default function LogosPage({ initialLogos, categories, searchQuery, formatFilter }: LogosPageProps) {
  const router = useRouter();
  const [logos, setLogos] = useState<Logo[]>(initialLogos);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSearch, setActiveSearch] = useState<string | undefined>(searchQuery);
  const [activeFormat, setActiveFormat] = useState<string | undefined>(formatFilter);

  // Clear search and format filters
  const clearSearch = () => {
    router.push({
      pathname: '/logos',
      query: { category: selectedCategory !== 'all' ? selectedCategory : undefined }
    });
  };

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    
    try {
      let fetchedLogos;
      if (activeSearch) {
        // If there's an active search, filter by search and category
        fetchedLogos = await searchLogos(activeSearch, activeFormat);
        // Client-side category filtering
        if (category !== 'all') {
          fetchedLogos = fetchedLogos.filter(logo => logo.category === category);
        }
      } else if (category === 'all') {
        fetchedLogos = await getAllLogos();
      } else {
        fetchedLogos = await getLogosByCategory(category);
      }
      setLogos(fetchedLogos);
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to handle URL parameter changes
  useEffect(() => {
    const { search, format, category } = router.query;
    
    setActiveSearch(search as string | undefined);
    setActiveFormat(format as string | undefined);
    
    if (category) {
      setSelectedCategory(category as string);
    }
    
    // This will be called on initial load and when URL params change
  }, [router.query]);

  return (
    <Layout title="Vector Logos | VectorLogo">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Vector Logos</h1>
        
        {/* Active search filters */}
        {activeSearch && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium">Search results for: </span>
              <span className="text-blue-700">"{activeSearch}"</span>
              {activeFormat && (
                <span className="ml-2 text-gray-600">Format: {activeFormat.toUpperCase()}</span>
              )}
            </div>
            <button 
              onClick={clearSearch}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      
      {/* Category Filter */}
      <div className="mb-4 sm:mb-8">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category:
        </label>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-md ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-md ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Grid */}
      <div className="mt-4 sm:mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : logos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No logos found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {logos.map(logo => (
              <div key={logo.id} className="border rounded-md p-3 hover:shadow-md transition-shadow">
                <div className="h-32 flex items-center justify-center p-2 bg-gray-50 rounded mb-2">
                  {logo.svg_url ? (
                    <img 
                      src={logo.svg_url} 
                      alt={logo.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : logo.png_url ? (
                    <img 
                      src={logo.png_url} 
                      alt={logo.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <h3 className="font-medium text-sm truncate">{logo.name}</h3>
                <p className="text-xs text-gray-500 truncate">{logo.category}</p>
                <div className="mt-2">
                  <Link 
                    href={`/logo/${logo.id}`}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded block text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { search, format, category } = context.query;
    let logos;
    
    // Handle search query if present
    if (search && typeof search === 'string') {
      logos = await searchLogos(search, format as string | undefined);
      
      // Apply category filter if needed
      if (category && category !== 'all') {
        logos = logos.filter(logo => logo.category === category);
      }
    } 
    // Handle category filter without search
    else if (category && category !== 'all') {
      logos = await getLogosByCategory(category as string);
    } 
    // Default: fetch all logos
    else {
      logos = await getAllLogos();
    }
    
    // Extract unique categories from all logos (not just filtered ones)
    const allLogos = await getAllLogos();
    const categories = Array.from(new Set(allLogos.map(logo => logo.category)));
    
    return {
      props: {
        initialLogos: logos,
        categories,
        searchQuery: search || null,
        formatFilter: format || null,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialLogos: [],
        categories: [],
        searchQuery: null,
        formatFilter: null,
      },
    };
  }
};
