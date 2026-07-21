import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: "Bagaimana cara mulai menggunakan Chatbot Kemenag?",
    answer: "Sangat mudah! Anda hanya perlu menekan tombol WhatsApp atau memindai QR code yang tersedia di halaman ini. Setelah itu, ketik 'Halo' atau pertanyaan Anda, dan chatbot akan langsung membalas secara otomatis."
  },
  {
    question: "Apa saja informasi yang bisa saya tanyakan ke Chatbot?",
    answer: "Anda dapat bertanya mengenai berbagai layanan administratif seperti syarat pencatatan nikah, prosedur pendaftaran haji, regulasi sertifikasi halal, jadwal shalat, hingga lokasi KUA terdekat."
  },
  {
    question: "Apakah layanan Chatbot ini tersedia 24 jam?",
    answer: "Ya, chatbot cerdas kami yang ditenagai oleh AI beroperasi selama 24 jam penuh setiap hari (24/7). Kapan pun Anda butuh informasi, chatbot siap melayani tanpa waktu tunggu."
  },
  {
    question: "Bagaimana jika pertanyaan saya tidak bisa dijawab oleh Chatbot?",
    answer: "Jika chatbot tidak memahami atau tidak memiliki informasi yang memadai terkait pertanyaan spesifik Anda, sistem akan secara otomatis meneruskan (menghubungkan) obrolan Anda ke agen Customer Service manusia kami pada jam kerja."
  }
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-transparent relative">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3 sticky top-32"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#f4d03f] rounded-full"></div>
              <h3 className="text-[#f4d03f] font-bold tracking-wider uppercase text-sm">FAQ</h3>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f2545] mb-6 leading-tight">
              Pertanyaan <br className="hidden lg:block"/> Umum
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Temukan jawaban cepat untuk pertanyaan-pertanyaan yang paling sering diajukan seputar penggunaan layanan Chatbot AI Kementerian Agama.
            </p>
            
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-kemenag-green shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0f2545] mb-1">Masih bingung?</h4>
                <p className="text-sm text-gray-500 mb-3">Tim kami siap membantu Anda melalui layanan WhatsApp chatbot.</p>
                <button className="text-sm font-bold text-kemenag-green hover:text-[#0f2545] transition-colors underline underline-offset-4">
                  Hubungi Chatbot
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/3"
          >
            <div className="flex flex-col gap-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                
                return (
                  <div 
                    key={index}
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden backdrop-blur-md ${
                      isOpen ? 'border-white bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)]' : 'border-white/50 bg-white/40 hover:bg-white/70 shadow-sm'
                    }`}
                  >
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className={`font-bold pr-8 text-lg ${isOpen ? 'text-[#0f2545]' : 'text-gray-700'}`}>
                        {faq.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen ? 'bg-kemenag-green text-white shadow-md' : 'bg-white text-gray-400'
                      }`}>
                        {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4 mt-2">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FaqSection;
