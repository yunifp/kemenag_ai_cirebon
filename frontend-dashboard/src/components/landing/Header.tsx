import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Globe, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // New States for Search and Language
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const langRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems: any[] = [];

  const handleDropdownEnter = (label: string) => setActiveDropdown(label);
  const handleDropdownLeave = () => setActiveDropdown(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      toast.success(`Mencari: ${searchQuery}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'bg-kemenag-dark/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] py-2 border-b border-white/5'
          : 'bg-gradient-to-b from-kemenag-dark/90 via-kemenag-dark/50 to-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src="/logo.webp" 
                alt="Logo Kemenag" 
                className="relative w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform duration-500 ease-out" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm md:text-base leading-tight tracking-wide group-hover:text-[#f4d03f] transition-colors duration-300">
                Kementerian Agama
              </span>
              <span className="text-gray-300 font-medium text-[10px] md:text-xs tracking-widest">
                Kabupaten Cirebon
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
              return (
                <div
                  key={item.label}
                  className="relative group px-3"
                  onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link
                    to={item.path}
                    className="flex items-center gap-1.5 py-2 relative z-10"
                  >
                    <span className={`font-semibold text-sm transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-white/70 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                  
                  {/* Active Indicator (Yellow Underline) */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1.5 left-3 right-3 h-1 bg-gradient-to-r from-[#f4d03f] to-[#f39c12] rounded-t-lg shadow-[0_0_10px_rgba(244,208,63,0.5)]" 
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions (Search, Language, Mobile Toggle) */}
          <div className="flex items-center gap-3">
            


            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-kemenag-dark/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
              

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
