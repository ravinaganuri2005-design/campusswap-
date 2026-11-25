import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeftRight, 
  Heart, 
  Gift, 
  ShoppingBag, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-emerald-700 bg-emerald-50 font-semibold'
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-100/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Campus<span className="text-emerald-600">Swap</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Buy • Sell • Swap • Save
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>
              Marketplace
            </NavLink>
            <NavLink to="/exchange" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
                Exchange
              </span>
            </NavLink>
            <NavLink to="/donate" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-purple-500" />
                Donate
              </span>
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell an Item</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all text-slate-700"
                >
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {user?.full_name || 'Student'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.full_name?.charAt(0) || 'S'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <p className="text-[10px] text-emerald-600 font-medium truncate mt-0.5">{user?.college_name}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Student Dashboard
                    </Link>

                    <Link
                      to="/dashboard?tab=enquiries"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      Enquiries & Messages
                    </Link>

                    <Link
                      to="/dashboard?tab=favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      Saved Favorites
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/sell"
              className="p-2 rounded-xl bg-emerald-600 text-white"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Marketplace
            </Link>
            <Link
              to="/exchange"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Exchange Hub
            </Link>
            <Link
              to="/donate"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Free Donation
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500">{user?.college_name}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Student Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
