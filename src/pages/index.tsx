import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAllLogos, Logo as LogoType } from '../lib/logoService';

// Logo type for the frontend
export type Logo = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  pngUrl: string;
  svgUrl: string;
};

// Convert database logo to frontend logo format
const convertLogoFormat = (dbLogo: LogoType): Logo => {
  const formatImageUrl = (url: string | undefined) => {
    if (!url) return '/placeholder-logo.png';
    if (url.startsWith('http')) return url;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = 'logos';
    // Remove leading slashes and bucket prefix if present
    let cleanPath = url.replace(/^\/+/, '');
    if (cleanPath.startsWith(`${bucket}/`)) cleanPath = cleanPath.slice(bucket.length + 1);
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  };

  return {
    id: dbLogo.id,
    name: dbLogo.name,
    category: dbLogo.category,
    categorySlug: dbLogo.category.toLowerCase().replace(/\s+/g, '-'),
    pngUrl: formatImageUrl(dbLogo.png_url),
    svgUrl: formatImageUrl(dbLogo.svg_url)
  };
};

const HomePage = ({ initialLogos }: { initialLogos: Logo[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [logos, setLogos] = useState<Logo[]>(initialLogos);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const fetchedLogos = await getAllLogos();
        const formattedLogos = fetchedLogos.map(convertLogoFormat);
        setLogos(formattedLogos);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(formattedLogos.map(logo => logo.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching logos:', error);
      }
    };
    fetchLogos();
  }, []);

  // Filter logos by selected category
  const filteredLogos = selectedCategory
    ? logos.filter(logo => logo.categorySlug === selectedCategory)
    : logos;

  return (
    <Layout title="Vector Logos - Download High-Quality Company Logos">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-6">Vector Logos</h1>
        
        {/* Category Filter */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">Filter by Category:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.toLowerCase().replace(/\s+/g, '-'))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.toLowerCase().replace(/\s+/g, '-')
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Logos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredLogos.length > 0 ? (
            filteredLogos.map((logo) => (
              <div key={logo.id} className="card group animate-fade-in h-full relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Logo Image */}
                <div className="h-32 sm:h-40 p-3 sm:p-4 flex items-center justify-center bg-gray-50 border-b">
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={logo.pngUrl}
                        alt={`${logo.name} logo`}
                        className="max-h-full max-w-full object-contain p-2"
                        onError={(e) => {
                          // Fallback to SVG if PNG fails to load
                          if (logo.svgUrl && logo.svgUrl !== logo.pngUrl) {
                            e.currentTarget.src = logo.svgUrl;
                          } else {
                            // If SVG is not available or same as PNG, show placeholder
                            e.currentTarget.src = '/placeholder-logo.png';
                          }
                          e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Logo Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-gray-900 text-center text-sm sm:text-base">{logo.name}</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">{logo.category}</p>
                  
                  {/* Actions */}
                  <div className="mt-4 flex justify-center">
                    <Link href={`/logo/${logo.id}`}>
                      <button className="btn btn-outline text-xs sm:text-sm flex items-center justify-center py-1 sm:py-2 w-full">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No logos found. Upload some logos to see them here!</p>
              <Link href="/upload">
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  Upload Logo
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const logos = await getAllLogos();
    const formattedLogos = logos.map(convertLogoFormat);
    
    return {
      props: {
        initialLogos: formattedLogos,
      },
    };
  } catch (error) {
    console.error('Error fetching logos:', error);
    return {
      props: {
        initialLogos: [],
      },
    };
  }
};

export default HomePage;
