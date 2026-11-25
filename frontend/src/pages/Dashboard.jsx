import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  Send, 
  MapPin, 
  Phone, 
  GraduationCap, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Inbox,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  authService, 
  productService, 
  favoriteService, 
  messagingService,
  getImageUrl 
} from '../services/api';
import ProductCard from '../components/ProductCard';

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'listings';

  // Stats
  const [stats, setStats] = useState({
    active_listings: 0,
    sold_listings: 0,
    total_listings: 0,
    favorites_count: 0,
    received_enquiries: 0,
    sent_enquiries: 0,
  });

  // Tab Data States
  const [myListings, setMyListings] = useState([]);
  const [listingFilter, setListingFilter] = useState('all'); // 'all', 'active', 'sold'
  const [favorites, setFavorites] = useState([]);
  const [receivedEnquiries, setReceivedEnquiries] = useState([]);
  const [sentEnquiries, setSentEnquiries] = useState([]);
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    college_name: user?.college_name || '',
    phone_number: user?.phone_number || '',
    year_of_study: user?.year_of_study || '',
    bio: user?.bio || '',
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await authService.getDashboardStats();
      setStats(statsRes.data);

      if (activeTab === 'listings') {
        const listRes = await productService.getMyListings();
        setMyListings(listRes.data.results || listRes.data);
      } else if (activeTab === 'favorites') {
        const favRes = await favoriteService.getFavorites();
        setFavorites(favRes.data.results || favRes.data);
      } else if (activeTab === 'enquiries') {
        const [recRes, sentRes] = await Promise.all([
          messagingService.getEnquiries('received'),
          messagingService.getEnquiries('sent'),
        ]);
        setReceivedEnquiries(recRes.data);
        setSentEnquiries(sentRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'sold' : 'active';
    try {
      await productService.updateStatus(productId, nextStatus);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await productService.deleteProduct(productId);
      setMyListings((prev) => prev.filter((p) => p.id !== productId));
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await favoriteService.removeFavorite(productId);
      setFavorites((prev) => prev.filter((f) => f.product?.id !== productId));
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenConversation = async (enquiryId) => {
    try {
      const res = await messagingService.getEnquiryDetail(enquiryId);
      setActiveEnquiry(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !activeEnquiry) return;
    try {
      setReplyLoading(true);
      await messagingService.sendReply({
        enquiry_id: activeEnquiry.id,
        body: replyBody.trim(),
      });
      setReplyBody('');
      // Reload full thread
      const res = await messagingService.getEnquiryDetail(activeEnquiry.id);
      setActiveEnquiry(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    try {
      setProfileSaving(true);
      await updateProfile(profileForm);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to update profile settings.");
    } finally {
      setProfileSaving(false);
    }
  };

  const filteredListings = myListings.filter((item) => {
    if (listingFilter === 'all') return true;
    return item.status === listingFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user?.college_name || 'College Student'}</span>
              <span>•</span>
              <span className="text-slate-400">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Listing</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Listings</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.active_listings}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Sold Items</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.sold_listings}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Saved Favorites</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">{stats.favorites_count}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Received Enquiries</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.received_enquiries}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Sent Enquiries</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{stats.sent_enquiries}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'listings', label: 'My Listings', icon: Package },
          { id: 'favorites', label: 'Saved Favorites', icon: Heart },
          { id: 'enquiries', label: 'Messages & Enquiries', icon: MessageSquare },
          { id: 'profile', label: 'Profile Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {['all', 'active', 'sold'].map((f) => (
                <button
                  key={f}
                  onClick={() => setListingFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    listingFilter === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f} Listings
                </button>
              ))}
            </div>

            <Link
              to="/sell"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Another Item</span>
            </Link>
          </div>

          {filteredListings.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
              {filteredListings.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/products/${item.id}`} className="font-bold text-sm text-slate-900 hover:text-emerald-600 truncate">
                          {item.title}
                        </Link>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'sold'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.category_display} • Condition: {item.condition_display}
                      </p>
                      <p className="text-xs font-black text-slate-900">
                        {item.listing_type === 'donation' ? 'Free Donation' : `₹${Number(item.selling_price).toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/products/${item.id}`}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title="View listing"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/products/${item.id}/edit`}
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100"
                      title="Edit listing"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleStatusToggle(item.id, item.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        item.status === 'active'
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {item.status === 'active' ? 'Mark Sold' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
              <Package className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No listings found in this category</h3>
              <p className="text-xs text-slate-500">Have old textbooks or gear to sell? Post your first item.</p>
              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Sell an Item</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div key={fav.id} className="relative">
                  <ProductCard product={fav.product} onFavoriteToggle={() => handleRemoveFavorite(fav.product.id)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
              <Heart className="w-12 h-12 text-rose-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Saved Favorites Yet</h3>
              <p className="text-xs text-slate-500">Click the heart icon on any product in the marketplace to save it here.</p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Enquiries & Messages */}
      {activeTab === 'enquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Inbox List (Received & Sent) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-6">
            
            {/* Received Enquiries Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Received Enquiries (Sellers)</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">{receivedEnquiries.length}</span>
              </h3>

              {receivedEnquiries.length > 0 ? (
                <div className="space-y-2">
                  {receivedEnquiries.map((enq) => (
                    <button
                      key={enq.id}
                      onClick={() => handleOpenConversation(enq.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        activeEnquiry?.id === enq.id
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{enq.product_title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(enq.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        <span className="font-semibold text-emerald-800">{enq.buyer_name}:</span> {enq.last_message?.body || 'New enquiry'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No incoming enquiries yet.</p>
              )}
            </div>

            {/* Sent Enquiries Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Sent Enquiries (Buyers)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">{sentEnquiries.length}</span>
              </h3>

              {sentEnquiries.length > 0 ? (
                <div className="space-y-2">
                  {sentEnquiries.map((enq) => (
                    <button
                      key={enq.id}
                      onClick={() => handleOpenConversation(enq.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        activeEnquiry?.id === enq.id
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{enq.product_title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(enq.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        To <span className="font-semibold">{enq.seller_name}</span>: {enq.last_message?.body || enq.subject}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">You haven't sent any enquiries yet.</p>
              )}
            </div>

          </div>

          {/* Active Conversation Pane */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm min-h-[460px] flex flex-col justify-between">
            {activeEnquiry ? (
              <div className="flex flex-col h-full justify-between space-y-4">
                
                {/* Header */}
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{activeEnquiry.subject}</h3>
                    <p className="text-xs text-slate-500">
                      Product: <strong>{activeEnquiry.product_title}</strong> (₹{Number(activeEnquiry.product_price).toLocaleString('en-IN')})
                    </p>
                  </div>
                  <Link
                    to={`/products/${activeEnquiry.product}`}
                    className="p-1.5 text-xs text-emerald-600 font-semibold hover:bg-emerald-50 rounded-lg flex items-center gap-1"
                  >
                    <span>View Product</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto space-y-3 max-h-80 pr-2">
                  {activeEnquiry.messages?.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}>
                          <p className="font-bold text-[10px] mb-1 opacity-80">{msg.sender_name}</p>
                          <p>{msg.body}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Type a message (e.g. Can meet outside library at 4 PM)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={replyLoading || !replyBody.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <Inbox className="w-12 h-12 text-slate-300" />
                <h4 className="font-bold text-sm text-slate-700">Select an Enquiry</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Choose a message from your received or sent inbox to view conversation and reply.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student Profile Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Keep your college and contact information updated.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College / University Name</label>
              <input
                type="text"
                value={profileForm.college_name}
                onChange={(e) => setProfileForm({ ...profileForm, college_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year & Branch of Study</label>
                <input
                  type="text"
                  value={profileForm.year_of_study}
                  onChange={(e) => setProfileForm({ ...profileForm, year_of_study: e.target.value })}
                  placeholder="e.g. 3rd Year B.Tech CSE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={profileForm.phone_number}
                  onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Brief intro about yourself or items you usually buy/sell..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <span>{profileError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              {profileSaving ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
