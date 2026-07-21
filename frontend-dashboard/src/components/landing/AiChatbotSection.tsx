import React from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageCircle, Zap, QrCode, ShieldCheck, Clock } from 'lucide-react';

const AiChatbotSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-transparent overflow-hidden">
      {/* Decorative gradient for Chatbot section */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[150%] bg-[#0f5132]/5 rotate-12 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[120%] bg-[#f4d03f]/5 -rotate-12 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Content Left */}
          <div className="w-full lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kemenag-green/10 border border-kemenag-green/20 text-kemenag-green font-bold text-sm tracking-widest uppercase mb-6 backdrop-blur-sm shadow-sm">
                <Bot className="w-4 h-4" />
                Inovasi Layanan Cerdas
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f2545] mb-6 leading-[1.1]">
                Asisten AI Kemenag <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-kemenag-green to-[#50C878]">
                  Siap Melayani 24/7
                </span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                Dapatkan informasi seputar pendaftaran haji, jadwal sholat, panduan KUA, hingga regulasi keagamaan dalam hitungan detik. Asisten AI cerdas kami siap menjawab pertanyaan Anda kapan saja, langsung dari WhatsApp Anda.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-start gap-3 bg-white/60 p-4 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 border border-green-200">
                    <Zap className="w-5 h-5 text-kemenag-green" />
                  </div>
                  <div>
                    <h4 className="text-[#0f2545] font-bold mb-1">Respon Instan</h4>
                    <p className="text-sm text-gray-500">Tanpa antrean, jawaban seketika.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/60 p-4 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0 border border-yellow-200">
                    <ShieldCheck className="w-5 h-5 text-[#f39c12]" />
                  </div>
                  <div>
                    <h4 className="text-[#0f2545] font-bold mb-1">Data Akurat</h4>
                    <p className="text-sm text-gray-500">Dari database resmi Kemenag.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-kemenag-green text-white px-8 py-4 rounded-xl font-bold hover:bg-[#136B44] transition-all duration-300 shadow-[0_0_20px_rgba(25,135,84,0.4)] hover:shadow-[0_0_30px_rgba(25,135,84,0.6)] hover:-translate-y-1"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat Sekarang
                </a>
              </div>
            </motion.div>
          </div>

          {/* QR Code Right */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              {/* Outer Glow & Decoration */}
              <div className="absolute inset-0 bg-white/40 blur-[40px] opacity-100 rounded-[3rem]"></div>
              
              <div className="relative bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center text-center max-w-sm">
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-kemenag-green to-[#015838] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 border-2 border-white"
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-extrabold text-[#0f2545] mb-2">Pindai & Mulai</h3>
                <p className="text-gray-500 text-sm mb-8 font-medium">Scan Barcode menggunakan kamera HP Anda untuk terhubung ke WhatsApp AI kami.</p>
                
                {/* Scanner Frame */}
                <div className="relative p-6 bg-white/90 rounded-2xl mb-6 group cursor-pointer shadow-sm border border-gray-100">
                  {/* Scanning Laser Animation */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 w-full h-0.5 bg-kemenag-green shadow-[0_0_15px_#198754] z-10"
                    />
                  </div>
                  
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#f4d03f] rounded-tl-xl -translate-x-2 -translate-y-2"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#f4d03f] rounded-tr-xl translate-x-2 -translate-y-2"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#f4d03f] rounded-bl-xl -translate-x-2 translate-y-2"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#f4d03f] rounded-br-xl translate-x-2 translate-y-2"></div>
                  
                  {/* Dummy QR */}
                  <QrCode className="w-48 h-48 text-[#0f2545]" strokeWidth={1.5} />
                </div>
                
                <div className="flex items-center gap-2 text-[#0f2545] font-bold text-sm bg-white/50 px-4 py-2 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 text-[#f39c12]" />
                  Selalu Aktif Melayani Umat
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default AiChatbotSection;
