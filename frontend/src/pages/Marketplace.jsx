import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  PackageOpen,
  RotateCcw
} from 'lucide-react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all');
  const [listingType, setListingType] = useState(searchParams.get('listing_type') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data States
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync search params with state
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (category && category !== 'all') params.category = category;
    if (condition && condition !== 'all') params.condition = condition;
    if (listingType && listingType !== 'all') params.listing_type = listingType;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (sort && sort !== 'recent') params.sort = sort;
    if (page > 1) params.page = page;

    setSearchParams(params, { replace: true });
    fetchProducts();
  }, [category, condition, listingType, sort, page]);

  const fetchProducts = async (customSearch = null) => {
    try {
      setLoading(true);
      const query = {
        page,
        sort,
      };
      const activeSearch = customSearch !== null ? customSearch : searchTerm;
      if (activeSearch) query.search = activeSearch;
      if (category && category !== 'all') query.category = category;
      if (condition && condition !== 'all') query.condition = condition;
      if (listingType && listingType !== 'all') query.listing_type = listingType;
      if (minPrice) query.min_price = minPrice;
      if (maxPrice) query.max_price = maxPrice;

      const res = await productService.getProducts(query);
      if (res.data.results) {
        setProducts(res.data.results);
        setTotalCount(res.data.count);
        setTotalPages(Math.ceil(res.data.count / 12) || 1);
      } else {
        setProducts(res.data);
        setTotalCount(res.data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(searchTerm);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setCondition('all');
    setListingType('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('recent');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Top Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Campus Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find textbooks, engineering instruments, electronics and hostel gear listed by verified peers.
            </p>
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({category !== 'all' || condition !== 'all' || listingType !== 'all' ? 'Active' : 'All'})</span>
          </button>
        </div>

        {/* Search Input & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name, textbook author, or description..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                  fetchProducts('');
                }}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 sm:w-56">
            <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Filters Sidebar */}
        <aside
          className={`md:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-6`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Listing Type Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Listing Type
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Listings' },
                { id: 'sale', label: 'For Sale' },
                { id: 'exchange', label: 'For Exchange' },
                { id: 'donation', label: 'Free Donation' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setListingType(t.id);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    listingType === t.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'books_notes', label: 'Books and Notes' },
                { id: 'electronics', label: 'Electronics' },
                { id: 'academic_equipment', label: 'Academic Equipment' },
                { id: 'hostel_essentials', label: 'Hostel Essentials' },
                { id: 'sports_equipment', label: 'Sports Equipment' },
                { id: 'other', label: 'Other Essentials' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    category === c.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Condition
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'Any Condition' },
                { id: 'like_new', label: 'Like New' },
                { id: 'good', label: 'Good' },
                { id: 'used', label: 'Used' },
              ].map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => {
                    setCondition(cond.id);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    condition === cond.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                fetchProducts();
              }}
              className="w-full mt-1 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Apply Price
            </button>
          </div>
        </aside>

        {/* Product Cards Grid Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{products.length}</strong> of{' '}
              <strong className="text-slate-900">{totalCount}</strong> listings
            </span>
            {(category !== 'all' || condition !== 'all' || listingType !== 'all' || searchTerm) && (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Filters Applied
              </span>
            )}
          </div>

          {/* Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageOpen className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900">No Listings Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any second-hand products matching your active filters. Try adjusting your search query or reset filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-700 px-3">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Marketplace;
