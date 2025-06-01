import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLogoById, Logo } from '../../lib/logoService';
import Layout from '../../components/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface LogoDetailPageProps {
  logo: Logo | null;
}

export default function LogoDetailPage({ logo }: LogoDetailPageProps) {
  const router = useRouter();
  
  // Handle download function
  const handleDownload = (url: string, fileName: string) => {
    // Create an anchor element and set the href to the file URL
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Set the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!logo) {
    return (
      <Layout title="Logo Not Found | VectorLogo">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p>Logo not found. It may have been deleted or the ID is incorrect.</p>
          </div>
          <Link 
            href="/logos" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Logos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${logo.name} | VectorLogo`}>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Logo header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{logo.name}</h1>
            <p className="text-sm text-gray-500">Category: {logo.category}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo preview */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center h-64">
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
                    <div className="text-gray-400">No image available</div>
                  )}
                </div>
              </div>
              
              {/* Logo details */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                
                {logo.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                    <p className="text-gray-600">{logo.description}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Category</h3>
                  <p className="text-gray-600">{logo.category}</p>
                </div>
                
                {logo.created_at && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Added on</h3>
                    <p className="text-gray-600">{new Date(logo.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                
                {logo.updated_at && logo.updated_at !== logo.created_at && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Last updated</h3>
                    <p className="text-gray-600">{new Date(logo.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
                
                {/* Download buttons */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Download</h3>
                  <div className="flex flex-wrap gap-2">
                    {logo.svg_url && (
                      <button
                        onClick={() => handleDownload(logo.svg_url!, `${logo.name.toLowerCase().replace(/\s+/g, '-')}.svg`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download SVG
                      </button>
                    )}
                    
                    {logo.png_url && (
                      <button
                        onClick={() => handleDownload(logo.png_url!, `${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PNG
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.params as { id: string };
    const logo = await getLogoById(id);
    
    return {
      props: {
        logo,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        logo: null,
      },
    };
  }
};
