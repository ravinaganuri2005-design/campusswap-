import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Heart, ShieldCheck, Leaf, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Campus<span className="text-emerald-400">Swap</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              CampusSwap connects senior students with junior peers to buy, sell, exchange, and donate pre-loved college essentials. Empowering a circular campus economy.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <Leaf className="w-3.5 h-3.5" />
                Zero Waste Campus Initiative
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/exchange" className="hover:text-emerald-400 transition-colors">
                  Exchange Directory
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-emerald-400 transition-colors">
                  Free Student Donation
                </Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-emerald-400 transition-colors">
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/marketplace?category=books_notes" className="hover:text-emerald-400 transition-colors">
                  Books and Notes
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=academic_equipment" className="hover:text-emerald-400 transition-colors">
                  Academic Equipment
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=electronics" className="hover:text-emerald-400 transition-colors">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=hostel_essentials" className="hover:text-emerald-400 transition-colors">
                  Hostel Essentials
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=sports_equipment" className="hover:text-emerald-400 transition-colors">
                  Sports Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Campus Safety</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Always meet peers in well-lit, public college spots such as the Central Library, Department Foyer, or Student Canteen. Inspect products before exchanging.
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Peer-to-Peer Verified Students</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusSwap. Startup Innovation Competition Prototype.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Student Campuses
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Django & React Full-Stack MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
