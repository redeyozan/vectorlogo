import { useState, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import AdminLayout from '../../components/AdminLayout';

export default function TestUpload() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    const form = formRef.current;
    if (!form) return;
    
    const pngFile = (form.elements.namedItem('png') as HTMLInputElement)?.files?.[0];
    const svgFile = (form.elements.namedItem('svg') as HTMLInputElement)?.files?.[0];
    
    if (!pngFile || !svgFile) {
      setError('Both PNG and SVG files are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('name', (form.elements.namedItem('name') as HTMLInputElement).value);
      formData.append('category', (form.elements.namedItem('category') as HTMLInputElement).value);
      formData.append('description', (form.elements.namedItem('description') as HTMLTextAreaElement).value);
      formData.append('png', pngFile);
      formData.append('svg', svgFile);
      
      if (user) {
        formData.append('user_id', user.id);
      }
      
      // Send the request
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload files');
      }
      
      setResult(data);
      console.log('Upload result:', data);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error in test upload:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Test Direct Upload</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {result && (
          <div className="mb-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Upload Result:</h3>
            <div className="mb-4">
              <h4 className="font-semibold">Storage:</h4>
              <p>Status: {result.storage.success ? '✅ Success' : '❌ Failed'}</p>
              {result.storage.success && (
                <div className="ml-4">
                  <p>PNG URL: <a href={result.storage.urls.png} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.storage.urls.png}</a></p>
                  <p>SVG URL: <a href={result.storage.urls.svg} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.storage.urls.svg}</a></p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold">Database:</h4>
              <p>Status: {result.database.success ? '✅ Success' : '❌ Failed'}</p>
              {result.database.success ? (
                <div className="ml-4">
                  <p>Logo ID: {result.database.logo.id}</p>
                  <p>Name: {result.database.logo.name}</p>
                  <p>Category: {result.database.logo.category}</p>
                </div>
              ) : (
                result.database.error && (
                  <pre className="bg-gray-200 p-2 mt-1 overflow-auto max-h-40 text-xs">
                    {JSON.stringify(result.database.error, null, 2)}
                  </pre>
                )
              )}
            </div>
          </div>
        )}
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue="Test Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue="Technology"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Technology">Technology</option>
                <option value="Automotive">Automotive</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="png" className="block text-sm font-medium text-gray-700 mb-1">
                PNG File*
              </label>
              <input
                type="file"
                id="png"
                name="png"
                accept=".png"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="svg" className="block text-sm font-medium text-gray-700 mb-1">
                SVG File*
              </label>
              <input
                type="file"
                id="svg"
                name="svg"
                accept=".svg"
                required
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue="Test description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Test Direct Upload'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
