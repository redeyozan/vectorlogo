import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps, NextPage } from 'next';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { getLogosByCategory, Logo as LogoType } from '@/lib/logoService';

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
  return {
    id: dbLogo.id,
    name: dbLogo.name,
    category: dbLogo.category,
    categorySlug: dbLogo.category.toLowerCase().replace(/\s+/g, '-'),
    pngUrl: dbLogo.png_url || '/placeholder-logo.png',
    svgUrl: dbLogo.svg_url || '/placeholder-logo.png'
  };
};



type CategoryPageProps = {
  categorySlug: string;
  initialLogos: Logo[];
  categoryName: string;
};

const CategoryPage: NextPage<CategoryPageProps> = ({ categorySlug, initialLogos, categoryName }) => {
  const router = useRouter();
  const [logos, setLogos] = useState<Logo[]>(initialLogos);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>(categoryName);

  useEffect(() => {
    // Update state when props change (e.g., when navigating between categories)
    setLogos(initialLogos);
    setCategory(categoryName);
  }, [initialLogos, categoryName, categorySlug]);

  return (
    <Layout title={`${category} Logos - Vector Logos`}>
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {category} Logos
          </h1>
          <p className="text-lg text-gray-600">
            Download high-quality {category.toLowerCase()} company logos in PNG and SVG formats.
          </p>
        </div>

        {/* Back to all logos */}
        <div className="mb-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            &larr; Back to all logos
          </Link>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card animate-pulse rounded-lg shadow-sm">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
                  <div className="h-8 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))
          ) : logos.length > 0 ? (
            // Actual logos
            logos.map((logo) => (
              <div key={logo.id} className="card group animate-fade-in h-full relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Logo Image */}
                <div className="h-32 sm:h-40 p-3 sm:p-4 flex items-center justify-center bg-gray-50 border-b">
                  <div className="h-full w-full flex items-center justify-center">
                    <img
                      src={logo.pngUrl}
                      alt={`${logo.name} logo`}
                      className="max-h-full max-w-full object-contain p-2"
                    />
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
            // No logos found
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No logos found for this category.
              </p>
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const categorySlug = params?.slug as string;
  
  try {
    // Convert slug to category name (e.g., 'social-media' to 'Social Media')
    const categoryName = categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Fetch logos for this category
    const logos = await getLogosByCategory(categoryName);
    const formattedLogos = logos.map(convertLogoFormat);
    
    return {
      props: {
        categorySlug,
        categoryName,
        initialLogos: formattedLogos,
      },
    };
  } catch (error) {
    console.error(`Error fetching logos for category ${categorySlug}:`, error);
    return {
      props: {
        categorySlug,
        categoryName: categorySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        initialLogos: [],
      },
    };
  }
};

export default CategoryPage;
