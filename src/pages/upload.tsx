import { useState } from 'react';
import { useSession, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { addLogo } from '@/lib/logoService';

const Upload = () => {
  const session = useSession();
  const user = useUser();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pngFile, setPngFile] = useState<File | null>(null);
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    png: boolean;
    svg: boolean;
  }>({ png: false, svg: false });

  const categories = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Entertainment',
    'Social Media',
    'Education',
    'Food & Beverage',
    'Automotive',
    'Other'
  ];

  // Handle file upload using local storage instead of Supabase

  // Handle file upload
  const uploadFile = async (file: File, fileType: 'png' | 'svg'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const response = await fetch('/api/upload-logo-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category) {
      setError('Name and category are required');
      return;
    }
    
    if (!pngFile && !svgFile) {
      setError('At least one file (PNG or SVG) is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Upload files to Supabase Storage via our API
      let pngUrl = '';
      let svgUrl = '';
      
      if (pngFile) {
        try {
          pngUrl = await uploadFile(pngFile, 'png');
          setUploadStatus(prev => ({ ...prev, png: true }));
        } catch (err) {
          console.error('PNG upload error:', err);
          setError('Failed to upload PNG file. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      if (svgFile) {
        try {
          svgUrl = await uploadFile(svgFile, 'svg');
          setUploadStatus(prev => ({ ...prev, svg: true }));
        } catch (err) {
          console.error('SVG upload error:', err);
          setError('Failed to upload SVG file. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Add logo to database
      await addLogo({
        name,
        category,
        description,
        png_url: pngUrl,
        svg_url: svgUrl
      });
      
      // Redirect to logos page
      router.push('/logos');
      
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to add logo to database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Upload Logo - VectorLogo">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Upload Logo</h1>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {uploadStatus.png && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
                PNG file uploaded successfully!
              </div>
            )}
            
            {uploadStatus.svg && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
                SVG file uploaded successfully!
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Logo Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="pngFile" className="block text-sm font-medium text-gray-700">
                  PNG File
                </label>
                <input
                  id="pngFile"
                  type="file"
                  accept=".png"
                  onChange={(e) => setPngFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload a PNG version of the logo
                </p>
              </div>
              
              <div>
                <label htmlFor="svgFile" className="block text-sm font-medium text-gray-700">
                  SVG File
                </label>
                <input
                  id="svgFile"
                  type="file"
                  accept=".svg"
                  onChange={(e) => setSvgFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload an SVG version of the logo
                </p>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
                >
                  {loading ? 'Uploading...' : 'Upload Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Upload;
