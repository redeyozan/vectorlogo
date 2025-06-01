import { useState, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { uploadFile } from '../lib/storageService';
import { addLogo } from '../lib/logoService';

interface LogoUploaderProps {
  onUploadComplete?: (logoId: string) => void;
  onUploadError?: (error: Error) => void;
  showPreview?: boolean;
}

export default function LogoUploader({ 
  onUploadComplete, 
  onUploadError,
  showPreview = true 
}: LogoUploaderProps) {
  const user = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    description: ''
  });
  const [pngFile, setPngFile] = useState<File | null>(null);
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [pngPreview, setPngPreview] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
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
      const file = e.target.files[0];
      
      if (fileType === 'png') {
        setPngFile(file);
        
        // Create preview for PNG
        if (showPreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPngPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      } else {
        setSvgFile(file);
        
        // Create preview for SVG
        if (showPreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setSvgPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Other',
      description: ''
    });
    setPngFile(null);
    setSvgFile(null);
    setPngPreview(null);
    setSvgPreview(null);
    if (pngInputRef.current) pngInputRef.current.value = '';
    if (svgInputRef.current) svgInputRef.current.value = '';
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      setError('Please enter a name for the logo');
      return;
    }
    
    if (!pngFile && !svgFile) {
      setError('Please upload at least one logo file (PNG or SVG)');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to upload logos');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      // Create a logo object to store in the database
      const logoData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        user_id: user.id,
        png_url: '',
        svg_url: ''
      };
      
      // Upload PNG file if provided
      if (pngFile) {
        setUploadProgress(25);
        const pngUrl = await uploadFile(pngFile, 'logos', 'png');
        logoData.png_url = pngUrl;
        setUploadProgress(50);
      }
      
      // Upload SVG file if provided
      if (svgFile) {
        setUploadProgress(75);
        const svgUrl = await uploadFile(svgFile, 'logos', 'svg');
        logoData.svg_url = svgUrl;
        setUploadProgress(90);
      }
      
      // Save logo data to the database
      const newLogo = await addLogo(logoData);
      setUploadProgress(100);
      
      // Show success message
      setSuccess('Logo uploaded successfully!');
      
      // Call the onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete(newLogo.id);
      }
      
      // Reset form after successful upload
      setTimeout(resetForm, 3000);
      
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo. Please try again.');
      
      // Call the onUploadError callback if provided
      if (onUploadError && err instanceof Error) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload Logo</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Upload form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company/Logo Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Google, Facebook, etc."
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
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
              placeholder="Brief description of the logo or company (optional)"
            />
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
            {showPreview && pngPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <img 
                  src={pngPreview} 
                  alt="PNG Preview" 
                  className="h-16 w-16 object-contain bg-gray-100 p-1 rounded"
                />
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
            {showPreview && svgPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <img 
                  src={svgPreview} 
                  alt="SVG Preview" 
                  className="h-16 w-16 object-contain bg-gray-100 p-1 rounded"
                />
              </div>
            )}
          </div>
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}
        
        <div className="mt-6 flex items-center space-x-4">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            disabled={uploading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
