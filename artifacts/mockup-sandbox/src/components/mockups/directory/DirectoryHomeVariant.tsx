import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowUpRight, Flame, Map, Briefcase, Coffee, Star, Compass, Bell, Home, Bookmark, User } from 'lucide-react';
import './directory-variant.css';

export default function DirectoryHomeVariant() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrolled(target.scrollTop > 20);
    };
    const el = document.getElementById('main-scroll');
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="dir-variant-app w-full h-full relative max-w-[430px] mx-auto overflow-hidden shadow-2xl border-x border-white/5 bg-[#0B0E0C]">
      
      {/* Header */}
      <header className={`absolute top-0 inset-x-0 z-50 px-5 pt-12 pb-4 transition-all duration-300 ${scrolled ? 'glass-nav border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase mb-1 flex items-center gap-1">
              <MapPin size={10} className="text-accent" />
              Nairobi, Kenya
            </span>
            <h1 className="font-serif text-3xl leading-none tracking-tight">Curated Guide</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center relative">
            <Bell size={18} className="text-white/80" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent"></span>
          </button>
        </div>
        
        {/* Search Bar - only visible when near top */}
        <div className={`mt-5 transition-all duration-300 origin-top ${scrolled ? 'opacity-0 h-0 scale-y-0 overflow-hidden mt-0' : 'opacity-100 h-12'}`}>
          <div className="bg-surface border border-white/10 rounded-2xl h-12 flex items-center px-4 gap-3 w-full">
            <Search size={18} className="text-white/40" />
            <input 
              type="text" 
              placeholder="Places, jobs, events..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-white/40"
            />
            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
              <span className="text-[10px] text-white/40">⌘K</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div id="main-scroll" className="h-full overflow-y-auto hide-scrollbar pb-32 pt-40">
        
        {/* Category Pills */}
        <div className="px-5 mb-6 overflow-x-auto hide-scrollbar flex gap-3">
          {['All', 'Dining', 'Stays', 'Jobs', 'Events', 'Nightlife'].map((cat, i) => (
            <button key={cat} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-accent text-[#0B0E0C]' : 'bg-surface border border-white/10 text-white/70'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          
          {/* Hero Tile */}
          <div className="bento-item bento-large bg-surface border border-white/10 group cursor-pointer shadow-lg">
            <img src="/__mockup/images/dir-variant-naivasha.jpg" alt="Naivasha" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="image-dimmer"></div>
            <div className="relative z-20 mt-auto p-4 flex justify-between items-end">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Star size={12} className="text-accent fill-accent" />
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Editor's Pick</span>
                </div>
                <h3 className="font-serif text-3xl leading-tight">Weekend in Naivasha</h3>
                <p className="text-xs text-white/70 mt-1 font-medium">7 curated stays & experiences</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 mb-1">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>

          {/* Quick Access Tiles */}
          <div className="bento-item bento-square bg-[#1D2622] border border-white/5 p-4 flex flex-col justify-between hover:bg-[#25302b] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#E2A856]/10 flex items-center justify-center text-accent">
              <Briefcase size={20} />
            </div>
            <div>
              <h4 className="font-medium text-sm">Tech Jobs</h4>
              <p className="text-[10px] text-white/50 mt-1">42 new this week</p>
            </div>
          </div>

          <div className="bento-item bento-square bg-surface border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer">
            <img src="/__mockup/images/dir-variant-cafe.jpg" alt="Cafes" className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#141A17]/95"></div>
            <div className="relative z-10 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Coffee size={20} />
            </div>
            <div className="relative z-10">
              <h4 className="font-medium text-sm">Craft Coffee</h4>
              <p className="text-[10px] text-white/60 mt-1">Near Kilimani</p>
            </div>
          </div>

          {/* Trending Tile */}
          <div className="bento-item bento-large bg-surface border border-white/5 flex flex-row overflow-hidden cursor-pointer group">
            <div className="w-[45%] relative overflow-hidden">
              <img src="/__mockup/images/dir-variant-nairobi.jpg" alt="Nairobi" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="w-[55%] p-4 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-2">
                <Flame size={12} className="text-accent" />
                <span className="text-[10px] font-bold tracking-wider text-accent uppercase">Trending</span>
              </div>
              <h4 className="font-serif text-2xl leading-tight mb-2">Nairobi Tech Week 2024</h4>
              <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">The biggest gathering of developers, founders, and investors in East Africa.</p>
            </div>
          </div>

          <div className="bento-item bento-square bg-surface border border-white/5 p-4 flex flex-col justify-between hover:bg-[#1D2622] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Map size={20} />
            </div>
            <div>
              <h4 className="font-medium text-sm">Local Guides</h4>
              <p className="text-[10px] text-white/50 mt-1">Hidden gems</p>
            </div>
          </div>

          <div className="bento-item bento-square bg-surface border border-white/5 p-4 flex flex-col justify-between items-center text-center justify-center gap-3 hover:bg-[#1D2622] transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <Compass size={22} className="text-white/60" />
            </div>
            <span className="text-xs text-white/60 font-medium">Explore All<br/>Categories</span>
          </div>

        </div>
        
        {/* Weekly Top Rated list */}
        <div className="px-5 mt-8 mb-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-serif text-2xl">Highly Rated</h2>
            <button className="text-xs text-accent font-medium hover:underline tracking-wide uppercase">See all</button>
          </div>
          
          <div className="flex flex-col gap-3">
            {[
              { name: 'Kobo Safari Lodge', type: 'Stay', rating: 4.9, img: '/__mockup/images/dir-variant-naivasha.jpg' },
              { name: 'Pallet Cafe', type: 'Dining', rating: 4.8, img: '/__mockup/images/dir-variant-cafe.jpg' },
              { name: 'Nairobi National Museum', type: 'Experience', rating: 4.7, img: '/__mockup/images/dir-variant-nairobi.jpg' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl bg-surface border border-white/5 items-center cursor-pointer hover:bg-surface-elevated transition-colors">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative">
                  <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-[11px] text-white/50 mt-1">{item.type}</p>
                </div>
                <div className="flex items-center gap-1 bg-[#1D2622] px-2 py-1 rounded-md border border-white/5">
                  <Star size={10} className="text-accent fill-accent" />
                  <span className="text-xs font-semibold">{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-6 inset-x-6 z-50 pointer-events-none">
        <div className="glass-nav rounded-full border border-white/10 px-6 py-4 flex justify-between items-center shadow-2xl pointer-events-auto">
          <button className="text-white flex flex-col items-center gap-1">
            <Home size={22} className="text-accent" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors flex flex-col items-center gap-1">
            <Compass size={22} />
          </button>
          <div className="relative -top-6">
            <button className="w-14 h-14 rounded-full bg-accent text-[#0B0E0C] flex items-center justify-center shadow-[0_8px_20px_rgba(226,168,86,0.3)] hover:scale-105 transition-transform">
              <MapPin size={24} />
            </button>
          </div>
          <button className="text-white/40 hover:text-white transition-colors flex flex-col items-center gap-1">
            <Bookmark size={22} />
          </button>
          <button className="text-white/40 hover:text-white transition-colors flex flex-col items-center gap-1">
            <User size={22} />
          </button>
        </div>
      </div>
      
    </div>
  );
}