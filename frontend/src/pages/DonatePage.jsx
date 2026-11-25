import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, PlusCircle, Search, Heart } from 'lucide-react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';

const DonatePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ listing_type: 'donation' });
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
            <Gift className="w-3.5 h-3.5" />
            <span>Campus Kindness & Peer Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Free Student Donations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Graduating seniors and generous peers giving away semester essentials, lab materials, study lamps, and course notes completely for free.
          </p>
        </div>

        <Link
          to="/sell"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Donate an Item for Free</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search free donations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <Gift className="w-12 h-12 text-purple-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Donations Currently Listed</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Have unused notes or equipment? Help a junior student by listing a free donation!
          </p>
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
          >
            Create Free Donation
          </Link>
        </div>
      )}

    </div>
  );
};

export default DonatePage;
