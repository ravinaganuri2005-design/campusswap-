import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Save, X, Upload } from 'lucide-react';
import { productService, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'books_notes',
    original_price: '',
    selling_price: '',
    condition: 'good',
    listing_type: 'sale',
    exchange_preference: '',
    college_name: '',
  });

  const [currentImage, setCurrentImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await productService.getProduct(id);
        const p = res.data;

        // Security check
        if (p.seller?.id && user?.id && p.seller.id !== user.id) {
          navigate('/marketplace');
          return;
        }

        setFormData({
          title: p.title,
          description: p.description,
          category: p.category,
          original_price: String(p.original_price),
          selling_price: String(p.selling_price),
          condition: p.condition,
          listing_type: p.listing_type,
          exchange_preference: p.exchange_preference || '',
          college_name: p.college_name || '',
        });
        if (p.image) {
          setCurrentImage(getImageUrl(p.image));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch listing details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'listing_type' && value === 'donation' ? { selling_price: '0' } : {}),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (formData.listing_type === 'exchange' && !formData.exchange_preference.trim()) {
      setError('Please describe what item you want in exchange.');
      return;
    }

    try {
      setSaving(true);
      const postData = new FormData();
      postData.append('title', formData.title.trim());
      postData.append('description', formData.description.trim());
      postData.append('category', formData.category);
      postData.append('original_price', formData.original_price);
      postData.append('selling_price', formData.listing_type === 'donation' ? 0 : formData.selling_price);
      postData.append('condition', formData.condition);
      postData.append('listing_type', formData.listing_type);
      if (formData.exchange_preference) {
        postData.append('exchange_preference', formData.exchange_preference.trim());
      }
      postData.append('college_name', formData.college_name.trim());

      if (imageFile) {
        postData.append('image', imageFile);
      }

      await productService.updateProduct(id, postData);
      navigate(`/products/${id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to update listing. Please verify inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Listing Type *
            </label>
            <select
              name="listing_type"
              value={formData.listing_type}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="sale">For Sale</option>
              <option value="exchange">For Exchange</option>
              <option value="donation">Free Donation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="books_notes">Books and Notes</option>
                <option value="electronics">Electronics</option>
                <option value="academic_equipment">Academic Equipment</option>
                <option value="hostel_essentials">Hostel Essentials</option>
                <option value="sports_equipment">Sports Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Original Price (₹) *
              </label>
              <input
                type="number"
                name="original_price"
                min="1"
                value={formData.original_price}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="selling_price"
                min="0"
                disabled={formData.listing_type === 'donation'}
                value={formData.listing_type === 'donation' ? '0' : formData.selling_price}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              required
            />
          </div>

          {/* Image preview / replace */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Update Photo (Optional)
            </label>
            {(imagePreview || currentImage) && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-48 mb-3 bg-slate-100 flex items-center justify-center">
                <img src={imagePreview || currentImage} alt="Current" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
