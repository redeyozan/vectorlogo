import type { NextPage } from 'next';
import Layout from '@/components/Layout';

const AboutPage: NextPage = () => {
  return (
    <Layout title="About - VectorLogo">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About VectorLogo</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            VectorLogo provides high-quality company logos in both PNG and SVG formats for designers, 
            developers, and marketers. Our mission is to create a comprehensive library of vector 
            logos that are easily accessible and ready to use in your projects.
          </p>
          <p className="text-gray-700">
            Whether you need logos for presentations, websites, mobile apps, or print materials, 
            our collection offers the flexibility of both raster (PNG) and vector (SVG) formats 
            to suit your specific needs.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>High-quality logos in PNG and SVG formats</li>
            <li>Organized by industry categories for easy browsing</li>
            <li>Regular updates with new logos</li>
            <li>Simple search functionality to find specific companies</li>
            <li>Free downloads for registered users</li>
            <li>Minimalist and modern user interface</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Guidelines</h2>
          <p className="text-gray-700 mb-4">
            The logos available on VectorLogo are the property of their respective owners and are 
            protected by copyright laws. We provide these logos for reference purposes only.
          </p>
          <p className="text-gray-700 mb-4">
            Before using any logo for commercial purposes, please ensure that you have the right 
            to use it according to the brand guidelines of the respective company. VectorLogo does 
            not grant any rights to use these logos commercially without proper authorization.
          </p>
          <p className="text-gray-700">
            For personal and educational projects, you may use these logos with proper attribution 
            to the original brand owners.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
