import React, { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import AiChatbotSection from '../components/landing/AiChatbotSection';
import QuoteSection from '../components/landing/QuoteSection';
import FaqSection from '../components/landing/FaqSection';

const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = "⛶ QR-KDR - Kemenag Kab. Cirebon";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-green-50/30 to-[#f8fafc] relative overflow-hidden">
      {/* Global Background Blobs to unify the design */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[800px] bg-kemenag-green/5 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[60%] right-[-10%] w-[30%] h-[600px] bg-[#f4d03f]/10 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>
      
      <div className="relative z-10">
        <HeroSection />
        <AiChatbotSection />
        <QuoteSection />
        <FaqSection />
      </div>
    </div>
  );
};

export default LandingPage;
