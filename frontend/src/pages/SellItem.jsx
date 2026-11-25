import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Tag, 
  HelpCircle,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PriceAssistantWidget from '../components/PriceAssistantWidget';

const SellItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'books_notes',
    original_price: '',
    selling_price: '',
    condition: 'good',
    listing_type: 'sale',
    exchange_preference: '',
    college_name: user?.college_name || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPriceAssistant, setShowPriceAssistant] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // If free donation, force selling price to 0
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleApplySuggestedPrice = (price) => {
    setFormData((prev) => ({
      ...prev,
      selling_price: String(price),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) {
      setError('Please provide a listing title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (!formData.original_price || Number(formData.original_price) <= 0) {
      setError('Original price must be greater than ₹0.');
      return;
    }
    if (formData.listing_type === 'sale' && (formData.selling_price === '' || Number(formData.selling_price) < 0)) {
      setError('Please enter a valid selling price.');
      return;
    }
    if (formData.listing_type === 'exchange' && !formData.exchange_preference.trim()) {
      setError('Please mention what items or course supplies you want in return for exchange.');
      return;
    }

    try {
      setLoading(true);
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
      postData.append('college_name', formData.college_name.trim() || user?.college_name || 'Campus Student');

      if (imageFile) {
        postData.append('image', imageFile);
      }

      const res = await productService.createProduct(postData);
      navigate(`/products/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const apiErr = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(' ')
        : 'Failed to create listing. Please check your inputs.';
      setError(apiErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            List an Item on CampusSwap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Give your semester items a second life. Sell, swap, or donate to fellow students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPriceAssistant(!showPriceAssistant)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{showPriceAssistant ? 'Hide Fair Price Assistant' : 'Show Fair Price Assistant'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Listing Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Listing Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Listing Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'sale', label: 'For Sale', desc: 'Direct student price' },
                  { id: 'exchange', label: 'For Exchange', desc: 'Swap with peer' },
                  { id: 'donation', label: 'Free Donation', desc: 'Giveaway to junior' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      listing_type: type.id,
                      ...(type.id === 'donation' ? { selling_price: '0' } : {}),
                    }))}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formData.listing_type === type.id
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{type.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Engineering Mathematics Textbook 10th Ed."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Category & Condition Row */}
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
                  <option value="like_new">Like New (Mint / Barely Used)</option>
                  <option value="good">Good (Normal wear, fully working)</option>
                  <option value="used">Used (Well-loved, minor cosmetic marks)</option>
                </select>
              </div>
            </div>

            {/* Pricing Row */}
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
                  placeholder="e.g. 850"
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
                  placeholder={formData.listing_type === 'donation' ? 'Free (₹0)' : 'e.g. 250'}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    formData.listing_type === 'donation'
                      ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold'
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Exchange Preference (if exchange) */}
            {formData.listing_type === 'exchange' && (
              <div className="animate-in fade-in">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                  What item do you want in return? *
                </label>
                <input
                  type="text"
                  name="exchange_preference"
                  value={formData.exchange_preference}
                  onChange={handleInputChange}
                  placeholder="e.g. Want Raspberry Pi 4 or 3rd sem Microprocessor textbook"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50/50 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Product Description *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mention edition, included notes, physical condition, and preferred campus handover locations (e.g. Canteen, CSE Block)."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                required
              />
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Campus / College Name *
              </label>
              <input
                type="text"
                name="college_name"
                value={formData.college_name}
                onChange={handleInputChange}
                placeholder="e.g. Indian Institute of Technology, Delhi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Product Image (Max 5MB)
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-56 bg-slate-100 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">Click to upload photo</p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? 'Publishing Your Listing...' : 'Publish Product Listing'}
            </button>
          </form>
        </div>

        {/* Innovation Side Widget: AI Fair Price Assistant */}
        <div className="lg:col-span-5 space-y-6">
          {showPriceAssistant && (
            <PriceAssistantWidget
              initialName={formData.title}
              initialPrice={formData.original_price}
              initialCategory={formData.category}
              initialCondition={formData.condition}
              onApplyPrice={handleApplySuggestedPrice}
            />
          )}

          {/* Quick Listing Guidelines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Campus Listing Best Practices</span>
            </h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside leading-relaxed">
              <li>Mention edition number for academic textbooks.</li>
              <li>State whether batteries or chargers are included with gadgets.</li>
              <li>Donations are prioritized for 1st-year junior students.</li>
              <li>Always meet buyers in central campus public locations.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SellItem;
