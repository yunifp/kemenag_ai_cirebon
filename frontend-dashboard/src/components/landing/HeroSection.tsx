import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-visible bg-transparent">
      {/* Background Image Slider with Tint Overlay */}
      <div className="absolute top-0 left-0 right-0 h-full z-0 overflow-hidden bg-kemenag-dark">
        <motion.div 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url("/hero_kemenag.jpg")`
          }}
        />
        {/* Green Tint Overlay */}
        <div className="absolute inset-0 bg-kemenag-dark/80 mix-blend-multiply z-10"></div>
        {/* Additional gradient to make text pop and transition softly to the next section */}
        <div className="absolute inset-0 bg-gradient-to-b from-kemenag-dark/90 via-kemenag-green/40 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#015838] to-transparent z-20"></div>
      </div>

      {/* Main Content Container */}
      <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col items-center mt-10 md:mt-20">
        
        {/* Logos & Text Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-8 max-w-5xl"
        >
          {/* Logos Group */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10 p-2 backdrop-blur-sm border border-white/20 shadow-xl flex items-center justify-center">
               <img src="/logo.webp" alt="Logo Kemenag" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-xl" />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-1.5 h-28 bg-white rounded-full opacity-90 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>

          {/* Main Text */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight md:leading-[1.1] drop-shadow-lg tracking-tight">
              Pusat Layanan AI <br className="hidden md:block"/> Kabupaten Cirebon<br className="hidden md:block"/>
              <span className="text-[#f4d03f]"> ⛶ QR-KDR</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200 font-medium max-w-2xl drop-shadow-md">
              Quick Response Kapabel Dinamis dan Religious
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Footer / Contact Section beneath the hero text */}
      <div className="w-full mt-24 pt-8 border-t border-white/10 flex flex-col items-center justify-center z-10 relative">
         <p className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Layanan Kontak Resmi</p>
         <div className="flex items-center gap-8 text-white font-medium">
           <div className="flex items-center gap-2 hover:text-[#f4d03f] transition-colors cursor-pointer">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
             0231-123456
           </div>
           <div className="flex items-center gap-2 hover:text-[#f4d03f] transition-colors cursor-pointer">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             kemenagcirebon@kemenag.go.id
           </div>
         </div>
      </div>
    </section>
  );
};

export default HeroSection;
