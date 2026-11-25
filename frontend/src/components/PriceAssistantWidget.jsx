import React, { useState } from 'react';
import { Sparkles, HelpCircle, ArrowRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { pricingService } from '../services/api';

const PriceAssistantWidget = ({
  initialName = '',
  initialPrice = '',
  initialCategory = 'books_notes',
  initialCondition = 'good',
  onApplyPrice = null,
}) => {
  const [productName, setProductName] = useState(initialName);
  const [originalPrice, setOriginalPrice] = useState(initialPrice);
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState(initialCondition);

  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState('');

  const handleEstimate = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!productName.trim()) {
      setError('Please provide a product title to estimate.');
      return;
    }
    if (!originalPrice || Number(originalPrice) <= 0) {
      setError('Please enter a valid original purchase price (greater than ₹0).');
      return;
    }

    try {
      setLoading(true);
      const res = await pricingService.getPriceSuggestion({
        product_name: productName,
        original_price: Number(originalPrice),
        category,
        condition,
      });
      setSuggestion(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not calculate estimated price. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-xl relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              AI Fair Price Assistant
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Innovation Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">Rule-based campus resale valuation benchmark</p>
          </div>
        </div>
      </div>

      {/* Disclaimer Notice */}
      <div className="mb-4 bg-emerald-950/60 border border-emerald-800/40 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-emerald-200">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Estimated Resale Benchmark:</strong> Estimates reflect college second-hand market multipliers (Like New 70%-85%, Good 50%-70%, Used 25%-50%). Ready for real LLM API expansion.
        </span>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleEstimate} className="space-y-3 relative z-10">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Engineering Mathematics Kreyszig"
            className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Original Price (₹)</label>
            <input
              type="number"
              min="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 850"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="books_notes">Books and Notes</option>
              <option value="academic_equipment">Academic Equipment</option>
              <option value="electronics">Electronics</option>
              <option value="hostel_essentials">Hostel Essentials</option>
              <option value="sports_equipment">Sports Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="like_new">Like New (70% - 85%)</option>
              <option value="good">Good (50% - 70%)</option>
              <option value="used">Used (25% - 50%)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Analyzing Resale Multipliers...</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calculate Fair Price Recommendation</span>
            </>
          )}
        </button>
      </form>

      {/* Suggestion Output */}
      {suggestion && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 relative z-10 space-y-3">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                Recommended Price Range
              </span>
              <span className="text-[10px] text-slate-400 font-medium">INR (₹)</span>
            </div>

            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{suggestion.suggested_min_price} – ₹{suggestion.suggested_max_price}
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {suggestion.explanation}
            </p>

            {onApplyPrice && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onApplyPrice(suggestion.suggested_min_price)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
                >
                  Use Min: ₹{suggestion.suggested_min_price}
                </button>
                <button
                  type="button"
                  onClick={() => onApplyPrice(Math.round((suggestion.suggested_min_price + suggestion.suggested_max_price) / 2))}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Use Average: ₹{Math.round((suggestion.suggested_min_price + suggestion.suggested_max_price) / 2)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAssistantWidget;
