import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps, NextPage } from 'next';
import Layout from '@/components/Layout';
import LogoCard from '@/components/LogoCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Logo } from '@/components/LogoCard';
import { supabase } from '@/lib/supabase';

// Sample data - in a real app, this would come from Supabase
const SAMPLE_CATEGORIES = [
  { id: '1', name: 'Technology', slug: 'technology' },
  { id: '2', name: 'Finance', slug: 'finance' },
  { id: '3', name: 'Healthcare', slug: 'healthcare' },
  { id: '4', name: 'Retail', slug: 'retail' },
  { id: '5', name: 'Entertainment', slug: 'entertainment' },
  { id: '6', name: 'Social Media', slug: 'social-media' },
];

// Sample logos - in a real app, these would come from Supabase
const SAMPLE_LOGOS: Logo[] = [
  {
    id: '1',
    name: 'Google',
    category: 'Technology',
    categorySlug: 'technology',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: true,
  },
  {
    id: '2',
    name: 'Apple',
    category: 'Technology',
    categorySlug: 'technology',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: true,
  },
  {
    id: '3',
    name: 'Microsoft',
    category: 'Technology',
    categorySlug: 'technology',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: false,
  },
  {
    id: '4',
    name: 'Visa',
    category: 'Finance',
    categorySlug: 'finance',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: true,
  },
  {
    id: '5',
    name: 'Mastercard',
    category: 'Finance',
    categorySlug: 'finance',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: false,
  },
  {
    id: '6',
    name: 'Facebook',
    category: 'Social Media',
    categorySlug: 'social-media',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: true,
  },
];

type CategoryPageProps = {
  categorySlug: string;
};

const CategoryPage: NextPage<CategoryPageProps> = ({ categorySlug }) => {
  const router = useRouter();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch logos for this category from Supabase
    setLoading(true);
    
    // Find the category name
    const categoryObj = SAMPLE_CATEGORIES.find(cat => cat.slug === categorySlug);
    if (categoryObj) {
      setCategory(categoryObj.name);
    }
    
    // Filter logos by category
    const filteredLogos = SAMPLE_LOGOS.filter(logo => logo.categorySlug === categorySlug);
    setLogos(filteredLogos);
    setLoading(false);
    
    // Example of how you would fetch from Supabase:
    // const fetchCategoryLogos = async () => {
    //   try {
    //     const { data: categoryData } = await supabase
    //       .from('categories')
    //       .select('*')
    //       .eq('slug', categorySlug)
    //       .single();
    //
    //     if (categoryData) {
    //       setCategory(categoryData.name);
    //       
    //       const { data: logosData } = await supabase
    //         .from('logos')
    //         .select('*')
    //         .eq('category_id', categoryData.id)
    //         .order('name');
    //
    //       if (logosData) setLogos(logosData);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching category logos:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    //
    // fetchCategoryLogos();
  }, [categorySlug]);

  return (
    <Layout title={`${category || categorySlug} Logos - VectorLogo`}>
      {/* Category Header */}
      <section className="mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {category || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Logos
          </h1>
          <p className="text-lg text-gray-600">
            Download high-quality {category?.toLowerCase() || categorySlug} company logos in PNG and SVG formats.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter 
        categories={SAMPLE_CATEGORIES} 
        selectedCategory={categorySlug} 
      />

      {/* Logos Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
              <LogoCard key={logo.id} logo={logo} />
            ))
          ) : (
            // No logos found
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No logos found for this category. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const categorySlug = params?.slug as string;
  
  return {
    props: {
      categorySlug,
    },
  };
};

export default CategoryPage;
