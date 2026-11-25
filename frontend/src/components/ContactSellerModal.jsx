import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { messagingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ContactSellerModal = ({ product, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(`Interested in '${product?.title || ''}'`);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.id === product?.seller?.id || user?.id === product?.seller_id) {
      setError("You cannot message yourself about your own product.");
      return;
    }

    if (!message.trim()) {
      setError("Please write your message before sending.");
      return;
    }

    try {
      setLoading(true);
      await messagingService.sendEnquiry({
        product_id: product.id,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSentSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        navigate('/dashboard?tab=enquiries');
      }, 1500);
    } catch (err) {
      console.error(err);
      const apiErr = err.response?.data?.product_id?.[0] || err.response?.data?.error || "Failed to deliver enquiry.";
      setError(apiErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Contact Student Seller</h3>
            <p className="text-xs text-slate-500">
              Direct enquiry to {product.seller?.full_name || product.seller_name || 'Seller'}
            </p>
          </div>
        </div>

        {/* Product Summary Mini-Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs font-bold text-slate-900 truncate">{product.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{product.college_name}</p>
          </div>
          <div className="text-right">
            {product.listing_type === 'donation' ? (
              <span className="text-xs font-black text-purple-600 uppercase">Donation</span>
            ) : (
              <span className="text-sm font-black text-slate-900">₹{Number(product.selling_price).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-900">Enquiry Sent Successfully!</h4>
            <p className="text-xs text-slate-500">
              The seller has been notified. Redirecting to your enquiries inbox...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Enquiry regarding book condition and handover spot"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'm interested in buying this item. When and where on campus can we meet to inspect and complete the exchange?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-70"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending...' : 'Send Enquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactSellerModal;
