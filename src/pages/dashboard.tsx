import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import LogoUploader from '../components/LogoUploader';
import { getAllLogos, deleteLogo, Logo } from '../lib/logoService';
import { deleteFile } from '../lib/storageService';

export default function Dashboard() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  // Fetch user's logos on component mount
  useEffect(() => {
    if (user) {
      fetchUserLogos();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Fetch logos for the current user
  const fetchUserLogos = async () => {
    try {
      setLoading(true);
      
      // Get all logos
      const allLogos = await getAllLogos();
      
      // Filter logos for the current user
      const filteredLogos = allLogos.filter(logo => logo.user_id === user?.id);
      
      setUserLogos(filteredLogos);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your logos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle logo upload completion
  const handleUploadComplete = async (logoId: string) => {
    await fetchUserLogos();
    setShowUploader(false);
  };

  // Handle logo deletion
  const handleDelete = async (logo: Logo) => {
    if (window.confirm(`Are you sure you want to delete "${logo.name}"?`)) {
      try {
        setLoading(true);
        
        // Delete files from storage
        if (logo.png_url) {
          try {
            await deleteFile(logo.png_url);
          } catch (err) {
            console.error('Failed to delete PNG file:', err);
          }
        }
        
        if (logo.svg_url) {
          try {
            await deleteFile(logo.svg_url);
          } catch (err) {
            console.error('Failed to delete SVG file:', err);
          }
        }
        
        // Delete logo from database
        await deleteLogo(logo.id);
        
        // Refresh logos list
        await fetchUserLogos();
        
      } catch (err) {
        setError('Failed to delete logo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // If still loading and no user, show loading state
  if (loading && !user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
      
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user.email}</h2>
          <p className="text-gray-600">
            This is your personal dashboard where you can manage your logos.
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Logo Uploader */}
      <div className="mb-8">
        {showUploader ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload New Logo</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <LogoUploader 
              onUploadComplete={handleUploadComplete}
              onUploadError={(err) => setError(err.message)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowUploader(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload New Logo
          </button>
        )}
      </div>
      
      {/* User's Logos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Logos</h2>
        
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {!loading && userLogos.length === 0 && (
          <div className="bg-gray-50 p-8 text-center rounded-lg">
            <p className="text-gray-500 mb-4">You haven't uploaded any logos yet.</p>
            <button
              onClick={() => setShowUploader(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Your First Logo
            </button>
          </div>
        )}
        
        {!loading && userLogos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLogos.map(logo => (
              <div key={logo.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{logo.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {logo.category}
                  </span>
                </div>
                
                <div className="h-32 bg-gray-50 flex items-center justify-center mb-3 rounded">
                  {logo.svg_url ? (
                    <img 
                      src={logo.svg_url} 
                      alt={`${logo.name} logo`} 
                      className="h-24 w-24 object-contain" 
                    />
                  ) : logo.png_url ? (
                    <img 
                      src={logo.png_url} 
                      alt={`${logo.name} logo`} 
                      className="h-24 w-24 object-contain" 
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                
                {logo.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{logo.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    {logo.png_url && (
                      <a 
                        href={logo.png_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                      >
                        PNG
                      </a>
                    )}
                    {logo.svg_url && (
                      <a 
                        href={logo.svg_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                      >
                        SVG
                      </a>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(logo)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
