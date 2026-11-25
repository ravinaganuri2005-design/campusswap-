import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Laptop, 
  Compass, 
  Home as HomeIcon, 
  Trophy, 
  Package, 
  ShieldCheck, 
  Leaf, 
  Zap, 
  Users, 
  ArrowLeftRight, 
  Gift, 
  CheckCircle2, 
  TrendingUp,
  CircleDollarSign
} from 'lucide-react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getProducts({ page: 1 });
        const list = res.data.results || res.data;
        setFeaturedProducts(list.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      id: 'books_notes',
      name: 'Books and Notes',
      icon: BookOpen,
      desc: 'Textbooks, semester guides & handwritten notes',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white',
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: Laptop,
      desc: 'Calculators, keyboards, chargers & cables',
      color: 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white',
    },
    {
      id: 'academic_equipment',
      name: 'Academic Equipment',
      icon: Compass,
      desc: 'Drafters, lab coats, dissection & graphics kits',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white',
    },
    {
      id: 'hostel_essentials',
      name: 'Hostel Essentials',
      icon: HomeIcon,
      desc: 'Study lamps, kettles, bedsheets & storage',
      color: 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-600 group-hover:text-white',
    },
    {
      id: 'sports_equipment',
      name: 'Sports Equipment',
      icon: Trophy,
      desc: 'Badminton racquets, footballs & gym gear',
      color: 'bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-600 group-hover:text-white',
    },
    {
      id: 'other',
      name: 'Other Essentials',
      icon: Package,
      desc: 'Bicycle gear, dorm accessories & stationery',
      color: 'bg-teal-50 text-teal-700 border-teal-200 group-hover:bg-teal-600 group-hover:text-white',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register Student Account',
      desc: 'Sign up with your campus email to join your verified college peer community.',
    },
    {
      step: '02',
      title: 'List Your Product',
      desc: 'Snap a picture, set your price with the AI Fair Price Assistant, or offer it for swap or free donation.',
    },
    {
      step: '03',
      title: 'Connect with Students',
      desc: 'Receive direct enquiries from junior and senior peers looking for your item.',
    },
    {
      step: '04',
      title: 'Complete the Exchange',
      desc: 'Meet safely at the campus library or canteen to hand over and save money.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-14 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Innovation Competition Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Circular Economy & Second-Hand Marketplace</span>
            </div>
          </div>

          {/* Hero Main Copy */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Give Your Old Products a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
                New Life
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Buy, sell, exchange and donate second-hand products within your college community. Connect senior students with junior peers for affordable essentials.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sell"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm hover:border-slate-400 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Selling</span>
              </Link>
            </div>

            {/* Quick Metrics Ticker */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-black text-emerald-600">₹60K+</p>
                <p className="text-xs text-slate-500 font-medium">Student Savings</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium">Zero Commission</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-black text-blue-600">4+ Campuses</p>
                <p className="text-xs text-slate-500 font-medium">Verified Colleges</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-black text-teal-600">120 kg</p>
                <p className="text-xs text-slate-500 font-medium">E-Waste Prevented</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse essential semester supplies curated specifically for college life.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/marketplace?category=${cat.id}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-emerald-300 transition-all flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Campus Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span>Browse Full Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW CAMPUSSWAP WORKS */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Simple & Safe</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            How CampusSwap Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No packaging, no high shipping delays, no commissions. Straightforward student-to-student transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-400/80 mb-4 block">
                  {s.step}
                </span>
                <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE CAMPUSSWAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Why Choose CampusSwap?
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Built by students, for students. Redefining campus affordability and collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">0% Commission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlike generic platforms that take 10-25% cuts, CampusSwap is 100% free for students. Every rupee stays with the student seller and buyer.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Safe Campus Handover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Meet right on your college campus — at the library, departmental lounge, or cafeteria. Test calculators, inspect book pages, and pay in person.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">AI Fair Price Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unsure what your textbook or drafter is worth? Our rule-based AI assistant suggests honest student valuation ranges to guarantee speedy listings.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SUSTAINABILITY IMPACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-500/20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Leaf className="w-3.5 h-3.5" />
              <span>Campus Sustainability Impact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Driving Environmental Impact with Every Reuse
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Every book passed down to a junior prevents paper waste and saves trees. Every reused drafter, monitor, or kettle keeps hazardous electronic components out of municipal landfills.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-5 text-center">
              <span className="text-3xl font-black text-emerald-400">140+</span>
              <p className="text-xs text-emerald-200 mt-1 font-medium">Textbooks Reused</p>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-5 text-center">
              <span className="text-3xl font-black text-teal-300">85 kg</span>
              <p className="text-xs text-emerald-200 mt-1 font-medium">CO₂ Avoided</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
