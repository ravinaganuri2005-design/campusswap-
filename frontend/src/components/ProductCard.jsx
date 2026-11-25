import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Tag, ArrowLeftRight, Gift, Sparkles } from 'lucide-react';
import { getImageUrl, favoriteService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(product?.is_favorited || false);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoadingFav(true);
      if (isFavorited) {
        await favoriteService.removeFavorite(product.id);
        setIsFavorited(false);
        if (onFavoriteToggle) onFavoriteToggle(product.id, false);
      } else {
        await favoriteService.addFavorite(product.id);
        setIsFavorited(true);
        if (onFavoriteToggle) onFavoriteToggle(product.id, true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setLoadingFav(false);
    }
  };

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'like_new':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'used':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getListingBadge = () => {
    if (product.listing_type === 'donation') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
          <Gift className="w-3 h-3" />
          Free Donation
        </span>
      );
    }
    if (product.listing_type === 'exchange') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
          <ArrowLeftRight className="w-3 h-3" />
          For Exchange
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <Tag className="w-3 h-3" />
        For Sale
      </span>
    );
  };

  const imageUrl = getImageUrl(product.image);
  const discountPercent = product.original_price > product.selling_price && product.original_price > 0
    ? Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover hover:border-emerald-300/80 transition-all duration-300 flex flex-col h-full">
      
      {/* Top Image & Overlays */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-emerald-50 text-slate-400 p-4 text-center">
            <Tag className="w-10 h-10 mb-1 text-emerald-300" />
            <span className="text-xs font-medium text-slate-500">{product.category_display}</span>
          </div>
        )}

        {/* Status Overlay if Sold */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Listing Type Tag Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
          {getListingBadge()}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          onClick={handleFavoriteClick}
          disabled={loadingFav}
          aria-label="Add to favorites"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 scale-110'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 stroke-rose-500' : ''}`} />
        </button>

        {/* Discount Tag if For Sale */}
        {product.listing_type === 'sale' && discountPercent > 0 && (
          <div className="absolute bottom-2 left-3 z-10 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          
          {/* Category & Condition Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium truncate">
              {product.category_display || product.category}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getConditionColor(product.condition)}`}>
              {product.condition_display || product.condition}
            </span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 text-base">
              {product.title}
            </h3>
          </Link>

          {/* College Tag */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{product.college_name || 'Campus Student'}</span>
          </div>

          {/* Exchange Preference Note if applicable */}
          {product.listing_type === 'exchange' && product.exchange_preference && (
            <p className="text-[11px] text-blue-700 bg-blue-50/80 rounded-lg p-1.5 border border-blue-100 line-clamp-1">
              <span className="font-bold">Swap for:</span> {product.exchange_preference}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            {product.listing_type === 'donation' ? (
              <span className="text-lg font-black text-purple-600">FREE</span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-900">
                  ₹{Number(product.selling_price).toLocaleString('en-IN')}
                </span>
                {Number(product.original_price) > Number(product.selling_price) && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{Number(product.original_price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
