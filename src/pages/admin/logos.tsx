import { useState, useEffect, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { uploadFile, deleteFile } from '../../lib/storageService';
import { getAllLogos, addLogo, updateLogo, deleteLogo, Logo } from '../../lib/logoService';
import AdminLayout from '../../components/AdminLayout';

export default function LogoAdmin() {
  // State for storage initialization and configuration check
  const [initializingStorage, setInitializingStorage] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testingDatabase, setTestingDatabase] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);
  const user = useUser();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    png_url: '',
    svg_url: '',
    description: '',
    user_id: ''
  });
  
  // File inputs
  const [pngFile, setPngFile] = useState<File | null>(null);
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const pngInputRef = useRef<HTMLInputElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);
  
  // Categories
  const categories = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Entertainment',
    'Social Media',
    'Other'
  ];

  // Fetch logos on component mount
  useEffect(() => {
    fetchLogos();
  }, []);

  // Fetch all logos
  const fetchLogos = async () => {
    try {
      setLoading(true);
      const data = await getAllLogos();
      setLogos(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch logos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'png' | 'svg') => {
    if (e.target.files && e.target.files.length > 0) {
      if (fileType === 'png') {
        setPngFile(e.target.files[0]);
      } else {
        setSvgFile(e.target.files[0]);
      }
    }
  };

  // Set up form for editing
  const handleEdit = (logo: Logo) => {
    setEditingLogo(logo);
    setFormData({
      name: logo.name,
      category: logo.category,
      png_url: logo.png_url || '',
      svg_url: logo.svg_url || '',
      description: logo.description || '',
      user_id: logo.user_id || ''
    });
    
    // Reset file inputs
    setPngFile(null);
    setSvgFile(null);
    if (pngInputRef.current) pngInputRef.current.value = '';
    if (svgInputRef.current) svgInputRef.current.value = '';
  };

  // Reset form
  const handleCancel = () => {
    setEditingLogo(null);
    setFormData({
      name: '',
      category: '',
      png_url: '',
      svg_url: '',
      description: '',
      user_id: ''
    });
    
    // Reset file inputs
    setPngFile(null);
    setSvgFile(null);
    if (pngInputRef.current) pngInputRef.current.value = '';
    if (svgInputRef.current) svgInputRef.current.value = '';
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorDetails(null);
    
    // Validate form inputs
    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }
    
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    
    // For new logos, require both PNG and SVG files
    if (!editingLogo) {
      if (!pngFile) {
        setError('PNG file is required when adding a new logo');
        return;
      }
      
      if (!svgFile) {
        setError('SVG file is required when adding a new logo');
        return;
      }
    }
    
    try {
      console.log('Starting logo upload/update process...');
      setLoading(true);
      setUploading(true);
      
      // Create a copy of form data to update with file URLs
      const updatedFormData = { ...formData };
      console.log('Form data:', updatedFormData);
      
      // Add user_id to the logo data if user is authenticated
      if (user) {
        updatedFormData.user_id = user.id;
        console.log('Added user_id:', user.id);
      } else {
        console.warn('No authenticated user found');
      }
      
      // Upload PNG file if provided
      if (pngFile) {
        // If updating and there's an existing PNG URL, delete the old file
        if (editingLogo?.png_url) {
          try {
            await deleteFile(editingLogo.png_url);
          } catch (err) {
            console.error('Failed to delete old PNG file:', err);
            // Continue with the update even if deletion fails
          }
        }
        
        // Upload the new PNG file
        const pngUrl = await uploadFile(pngFile, 'logos', 'png');
        updatedFormData.png_url = pngUrl;
      }
      
      // Upload SVG file if provided
      if (svgFile) {
        // If updating and there's an existing SVG URL, delete the old file
        if (editingLogo?.svg_url) {
          try {
            await deleteFile(editingLogo.svg_url);
          } catch (err) {
            console.error('Failed to delete old SVG file:', err);
            // Continue with the update even if deletion fails
          }
        }
        
        // Upload the new SVG file
        const svgUrl = await uploadFile(svgFile, 'logos', 'svg');
        updatedFormData.svg_url = svgUrl;
      }
      
      if (editingLogo) {
        // Update existing logo
        await updateLogo(editingLogo.id, updatedFormData);
      } else {
        // Add new logo
        await addLogo(updatedFormData);
      }
      
      // Reset form and refresh logos
      handleCancel();
      await fetchLogos();
      
    } catch (err: any) {
      const baseError = editingLogo ? 'Failed to update logo' : 'Failed to add logo';
      setError(baseError);
      
      // Extract and display more detailed error information
      let details = '';
      if (err?.message) {
        details += err.message;
      }
      if (err?.details) {
        details += ' ' + err.details;
      }
      if (err?.hint) {
        details += ' Hint: ' + err.hint;
      }
      
      setErrorDetails(details || 'Unknown error occurred');
      console.error('Error in handleSubmit:', err);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Delete logo
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this logo?')) {
      try {
        setLoading(true);
        
        // Get the logo to delete
        const logoToDelete = logos.find(logo => logo.id === id);
        
        if (logoToDelete) {
          // Delete the associated files from storage
          if (logoToDelete.png_url) {
            try {
              await deleteFile(logoToDelete.png_url);
            } catch (err) {
              console.error('Failed to delete PNG file:', err);
              // Continue with deletion even if file deletion fails
            }
          }
          
          if (logoToDelete.svg_url) {
            try {
              await deleteFile(logoToDelete.svg_url);
            } catch (err) {
              console.error('Failed to delete SVG file:', err);
              // Continue with deletion even if file deletion fails
            }
          }
        }
        
        // Delete the logo from the database
        await deleteLogo(id);
        await fetchLogos();
      } catch (err) {
        setError('Failed to delete logo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Test database connection and insertion
  const testDatabaseConnection = async () => {
    try {
      setTestingDatabase(true);
      setError(null);
      setErrorDetails(null);
      
      const response = await fetch('/api/check-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testInsert: true,
          userId: user?.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to test database connection');
      }
      
      setDatabaseStatus(data);
      console.log('Database test result:', data);
      
      if (data.success) {
        // If successful, refresh the logos list
        await fetchLogos();
      } else {
        setError('Database test failed');
        setErrorDetails(JSON.stringify(data.details || 'Unknown error'));
      }
    } catch (err: any) {
      setError('Failed to test database connection');
      setErrorDetails(err.message || 'Unknown error');
      console.error('Database test error:', err);
    } finally {
      setTestingDatabase(false);
    }
  };
  
  // Check Supabase configuration
  const checkSupabaseConfig = async () => {
    try {
      setCheckingConfig(true);
      setError(null);
      setErrorDetails(null);
      
      const response = await fetch('/api/check-supabase-config');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check Supabase configuration');
      }
      
      setConfigStatus(data);
      console.log('Supabase configuration:', data);
      
      // If admin client is working, try to initialize storage
      if (data.adminClientWorking) {
        await initializeStorage();
      } else {
        setError('Supabase admin client not working');
        setErrorDetails('Please check that your SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local');
      }
    } catch (err: any) {
      setError('Failed to check Supabase configuration');
      setErrorDetails(err.message || 'Unknown error');
      console.error('Supabase config check error:', err);
    } finally {
      setCheckingConfig(false);
    }
  };
  
  // Initialize Supabase storage bucket
  const initializeStorage = async () => {
    try {
      setInitializingStorage(true);
      setError(null);
      setErrorDetails(null);
      
      const response = await fetch('/api/init-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize storage');
      }
      
      setStorageInitialized(true);
      console.log('Storage initialization result:', data);
    } catch (err: any) {
      setError('Failed to initialize storage');
      setErrorDetails(err.message || 'Unknown error');
      console.error('Storage initialization error:', err);
    } finally {
      setInitializingStorage(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Logo Administration</h1>
        
        {/* Storage initialization and config check buttons */}
        <div className="mb-6">
          <button
            onClick={checkSupabaseConfig}
            disabled={checkingConfig}
            className="px-4 py-2 rounded-md mr-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {checkingConfig ? 'Checking Config...' : 'Check Supabase Config'}
          </button>
          
          <button
            onClick={initializeStorage}
            disabled={initializingStorage || storageInitialized || checkingConfig}
            className={`px-4 py-2 rounded-md mr-2 ${storageInitialized ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50`}
          >
            {initializingStorage ? 'Initializing...' : storageInitialized ? 'Storage Initialized ✓' : 'Initialize Storage'}
          </button>
          
          <button
            onClick={testDatabaseConnection}
            disabled={testingDatabase}
            className="px-4 py-2 rounded-md mr-2 bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {testingDatabase ? 'Testing Database...' : 'Test Database Connection'}
          </button>
          
          <span className="text-sm text-gray-500">First check config, then initialize storage if needed</span>
        </div>
        
        {/* Configuration status */}
        {configStatus && (
          <div className="mb-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Supabase Configuration Status:</h3>
            <ul className="text-sm">
              <li>Supabase URL: {configStatus.config.supabaseUrl.exists ? '✅ Set' : '❌ Missing'}</li>
              <li>Anon Key: {configStatus.config.supabaseAnonKey.exists ? '✅ Set' : '❌ Missing'}</li>
              <li>Service Role Key: {configStatus.config.supabaseServiceKey.exists ? '✅ Set' : '❌ Missing'}</li>
              <li>Regular Client: {configStatus.regularClientWorking ? '✅ Working' : '❌ Not Working'}</li>
              <li>Admin Client: {configStatus.adminClientWorking ? '✅ Working' : '❌ Not Working'}</li>
            </ul>
            {!configStatus.config.supabaseServiceKey.exists && (
              <div className="mt-2 text-red-600">
                <p><strong>Missing Service Role Key!</strong> You need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.</p>
                <p>Get this from your Supabase project settings → API → service_role key.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Database test status */}
        {databaseStatus && (
          <div className="mb-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Database Test Result:</h3>
            <div className="text-sm">
              <p>Status: {databaseStatus.success ? '✅ Success' : '❌ Failed'}</p>
              {databaseStatus.success ? (
                <p className="text-green-600">Database connection and test insert successful!</p>
              ) : (
                <div className="text-red-600">
                  <p>Database test failed. Error details:</p>
                  <pre className="bg-gray-200 p-2 mt-1 overflow-auto max-h-40 text-xs">
                    {JSON.stringify(databaseStatus.details || {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">{error}</strong>
          {errorDetails && <p className="block sm:inline"> {errorDetails}</p>}
          {error.includes('bucket') && !configStatus?.adminClientWorking && (
            <div className="mt-2">
              <p><strong>Recommendation:</strong> Make sure your SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local</p>
              <p>1. Go to your Supabase project dashboard</p>
              <p>2. Navigate to Project Settings → API</p>
              <p>3. Copy the 'service_role key' (not the anon key)</p>
              <p>4. Add it to your .env.local file as SUPABASE_SERVICE_ROLE_KEY=your_key_here</p>
              <p>5. Restart your Next.js server</p>
            </div>
          )}
        </div>
      )}
      
      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingLogo ? 'Edit Logo' : 'Add New Logo'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PNG File
              </label>
              <input
                type="file"
                accept=".png,image/png"
                onChange={(e) => handleFileChange(e, 'png')}
                ref={pngInputRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {formData.png_url && (
                <div className="mt-2 text-sm text-gray-500">
                  Current: <a href={formData.png_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{formData.png_url.split('/').pop()}</a>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SVG File
              </label>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={(e) => handleFileChange(e, 'svg')}
                ref={svgInputRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {formData.svg_url && (
                <div className="mt-2 text-sm text-gray-500">
                  Current: <a href={formData.svg_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{formData.svg_url.split('/').pop()}</a>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {editingLogo ? 'Update Logo' : 'Add Logo'}
            </button>
            
            {editingLogo && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Logos Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="sr-only">Logos List</h2>
        
        {loading && !logos.length ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No logos found. Add your first logo above.
                  </td>
                </tr>
              ) : (
                logos.map(logo => (
                  <tr key={logo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{logo.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {logo.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {logo.svg_url ? (
                        <img 
                          src={logo.svg_url} 
                          alt={`${logo.name} logo`} 
                          className="h-10 w-10 object-contain" 
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(logo)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(logo.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
