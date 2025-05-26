import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
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
    id: '4',
    name: 'Visa',
    category: 'Finance',
    categorySlug: 'finance',
    pngUrl: 'https://via.placeholder.com/300',
    svgUrl: 'https://via.placeholder.com/300',
    featured: true,
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

const FeaturedPage: NextPage = () => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch featured logos from Supabase
    setLoading(true);
    
    // Filter logos by featured flag
    const featuredLogos = SAMPLE_LOGOS.filter(logo => logo.featured);
    setLogos(featuredLogos);
    setLoading(false);
    
    // Example of how you would fetch from Supabase:
    // const fetchFeaturedLogos = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('logos')
    //       .select('*')
    //       .eq('featured', true)
    //       .order('name');
    //
    //     if (error) throw error;
    //     if (data) setLogos(data);
    //   } catch (error) {
    //     console.error('Error fetching featured logos:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    //
    // fetchFeaturedLogos();
  }, []);

  return (
    <Layout title="Featured Logos - VectorLogo">
      {/* Featured Header */}
      <section className="mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Logos
          </h1>
          <p className="text-lg text-gray-600">
            Our collection of popular and high-quality company logos in PNG and SVG formats.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter 
        categories={SAMPLE_CATEGORIES} 
        selectedCategory="featured" 
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
                No featured logos available at the moment. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FeaturedPage;
