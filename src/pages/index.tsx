import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import LogoCard from '../components/LogoCard';
import CategoryFilter from '../components/CategoryFilter';
import { getAllLogos, Logo as LogoType } from '../lib/logoService';

// Using the Logo type from LogoCard component
import { Logo } from '../components/LogoCard';

// Convert database logo to frontend logo format
const convertLogoFormat = (dbLogo: LogoType): Logo => {
  return {
    id: dbLogo.id,
    name: dbLogo.name,
    category: dbLogo.category,
    categorySlug: dbLogo.category.toLowerCase().replace(/\s+/g, '-'),
    pngUrl: dbLogo.png_url || 'https://placehold.co/400x400?text=No+Image',
    svgUrl: dbLogo.svg_url || 'https://placehold.co/400x400?text=No+Image',
    featured: false // You might want to add this field to your database
  };
};

const HomePage = ({ initialLogos }: { initialLogos: Logo[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [logos, setLogos] = useState(initialLogos);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const logos = await getAllLogos();
        setLogos(logos.map(convertLogoFormat));
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
    <Layout title="VectorLogo - Download High-Quality Company Logos">
      
      {/* Main Content */}
        {/* Hero Section */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Download High-Quality Company Logos
            </h1>
            <p className="text-xl text-gray-600">
              Access a wide collection of company logos in PNG and SVG formats, organized by industry categories.
            </p>
          </div>
        </section>
        
        {/* Category Filter */}
        <div className="mb-8">
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
            
            {logos.map((logo, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(logo.categorySlug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === logo.categorySlug 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {logo.category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Logos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredLogos.map((logo) => (
            <LogoCard key={logo.id} logo={logo} />
          ))}
        </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const logos = await getAllLogos();
    
    return {
      props: {
        initialLogos: logos,
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
