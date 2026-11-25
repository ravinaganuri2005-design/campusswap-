import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  User, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Check, 
  Tag, 
  ArrowLeftRight, 
  Gift, 
  Share2,
  AlertCircle
} from 'lucide-react';
import { productService, favoriteService, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ContactSellerModal from '../components/ContactSellerModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await productService.getProduct(id);
      setProduct(res.data);
      setIsFavorited(res.data.is_favorited);
    } catch (err) {
      console.error("Failed to load product", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorited) {
        await favoriteService.removeFavorite(product.id);
        setIsFavorited(false);
      } else {
        await favoriteService.addFavorite(product.id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsSold = async () => {
    if (!window.confirm("Mark this product as Sold? It will be archived and hidden from public search.")) return;
    try {
      setActionLoading(true);
      const res = await productService.updateStatus(product.id, 'sold');
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsActive = async () => {
    try {
      setActionLoading(true);
      const res = await productService.updateStatus(product.id, 'active');
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this listing permanently?")) return;
    try {
      setActionLoading(true);
      await productService.deleteProduct(product.id);
      navigate('/marketplace');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading listing details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">This listing may have been removed or does not exist.</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id && (user.id === product.seller?.id || product.is_owner);
  const imageUrl = getImageUrl(product.image);
  const discountPercent = product.original_price > product.selling_price && product.original_price > 0
    ? Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left: Large Product Image */}
        <div className="lg:col-span-7 bg-slate-900 flex items-center justify-center relative min-h-[380px] lg:min-h-[520px] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-contain max-h-[560px]"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <Tag className="w-16 h-16 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No photo available</p>
            </div>
          )}

          {/* Status Overlay if Sold */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
              <span className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-black text-sm tracking-widest uppercase shadow-xl">
                Sold Out
              </span>
            </div>
          )}

          {/* Listing Type Tag Badge (Top Left) */}
          <div className="absolute top-4 left-4">
            {product.listing_type === 'donation' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-md">
                <Gift className="w-3.5 h-3.5" />
                Free Donation
              </span>
            )}
            {product.listing_type === 'exchange' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                For Exchange
              </span>
            )}
            {product.listing_type === 'sale' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                <Tag className="w-3.5 h-3.5" />
                For Sale
              </span>
            )}
          </div>
        </div>

        {/* Right: Details & Buying Information */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category & Condition Tags */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                {product.category_display || product.category}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Condition: {product.condition_display || product.condition}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Price Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {product.listing_type === 'donation' ? 'Student Contribution' : 'Selling Price'}
                </p>
                {product.listing_type === 'donation' ? (
                  <span className="text-3xl font-black text-purple-600">FREE</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{Number(product.selling_price).toLocaleString('en-IN')}
                    </span>
                    {Number(product.original_price) > Number(product.selling_price) && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{Number(product.original_price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {discountPercent > 0 && product.listing_type === 'sale' && (
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Save {discountPercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Exchange Preference Note if applicable */}
            {product.listing_type === 'exchange' && product.exchange_preference && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Desired Exchange Item
                </span>
                <p className="text-xs font-medium text-blue-900">
                  {product.exchange_preference}
                </p>
              </div>
            )}

            {/* Seller & Campus Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {product.seller?.full_name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {product.seller?.full_name || 'Campus Student'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{product.college_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Student</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Item Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {isOwner ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
                  You are the owner of this listing.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/products/${product.id}/edit`}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 text-center flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Listing</span>
                  </Link>

                  {product.status === 'active' ? (
                    <button
                      onClick={handleMarkAsSold}
                      disabled={actionLoading}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark as Sold</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleMarkAsActive}
                      disabled={actionLoading}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                    >
                      <span>Reactivate Listing</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={handleDeleteProduct}
                  disabled={actionLoading}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  disabled={product.status === 'sold'}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{product.status === 'sold' ? 'Item is Sold Out' : 'Contact Seller'}</span>
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isFavorited
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label="Save to favorites"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Contact Seller Modal */}
      <ContactSellerModal
        product={product}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={() => {}}
      />

    </div>
  );
};

export default ProductDetail;
