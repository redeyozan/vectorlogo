import { useState, useEffect } from 'react';
import { getAllLogos, addLogo, updateLogo, deleteLogo, Logo } from '../../lib/logoService';

export default function LogoAdmin() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    png_url: '',
    svg_url: '',
    description: ''
  });
  
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

  // Set up form for editing
  const handleEdit = (logo: Logo) => {
    setEditingLogo(logo);
    setFormData({
      name: logo.name,
      category: logo.category,
      png_url: logo.png_url || '',
      svg_url: logo.svg_url || '',
      description: logo.description || ''
    });
  };

  // Reset form
  const handleCancel = () => {
    setEditingLogo(null);
    setFormData({
      name: '',
      category: '',
      png_url: '',
      svg_url: '',
      description: ''
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingLogo) {
        // Update existing logo
        await updateLogo(editingLogo.id, formData);
      } else {
        // Add new logo
        await addLogo(formData);
      }
      
      // Reset form and refresh logos
      handleCancel();
      await fetchLogos();
      
    } catch (err) {
      setError(editingLogo ? 'Failed to update logo' : 'Failed to add logo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete logo
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this logo?')) {
      try {
        setLoading(true);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Logo Administration</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
                PNG URL
              </label>
              <input
                type="url"
                name="png_url"
                value={formData.png_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SVG URL
              </label>
              <input
                type="url"
                name="svg_url"
                value={formData.svg_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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
  );
}
