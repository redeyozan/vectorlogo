import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getAllLogos, getLogosByCategory, Logo } from '../lib/logoService';
import Layout from '../components/Layout';

interface LogosPageProps {
  initialLogos: Logo[];
  categories: string[];
}

export default function LogosPage({ initialLogos, categories }: LogosPageProps) {
  const [logos, setLogos] = useState<Logo[]>(initialLogos);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    
    try {
      let fetchedLogos;
      if (category === 'all') {
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

  return (
    <Layout title="Vector Logos | VectorLogo">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Vector Logos</h1>
      
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Logos Grid */}
      {!isLoading && (
        <>
          {logos.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No logos found in this category.</p>
          ) : (
            <div className="logo-grid">
              {logos.map((logo) => (
                <div key={logo.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md mb-4 flex items-center justify-center p-4">
                    {logo.svg_url ? (
                      <img 
                        src={logo.svg_url} 
                        alt={`${logo.name} logo`} 
                        className="max-h-24 object-contain" 
                      />
                    ) : (
                      <div className="text-gray-400">No image</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{logo.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Category: {logo.category}</p>
                  {logo.description && (
                    <p className="text-sm text-gray-600 mb-3">{logo.description}</p>
                  )}
                  <div className="flex space-x-2 mt-auto">
                    {logo.svg_url && (
                      <a 
                        href={logo.svg_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                      >
                        SVG
                      </a>
                    )}
                    {logo.png_url && (
                      <a 
                        href={logo.png_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                      >
                        PNG
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch all logos for initial load
    const logos = await getAllLogos();
    
    // Extract unique categories from logos
    const categories = Array.from(new Set(logos.map(logo => logo.category)));
    
    return {
      props: {
        initialLogos: logos,
        categories,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialLogos: [],
        categories: [],
      },
    };
  }
};
