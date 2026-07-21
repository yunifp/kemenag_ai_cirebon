import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const QuoteSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-transparent relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-kemenag-green/10 rounded-full blur-[100px] -z-0"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto bg-white/60 backdrop-blur-xl border border-white p-6 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] relative flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-10"
        >
          {/* Subtle Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 w-24 h-1 bg-[#f4d03f] rounded-b-full"></div>

          {/* Avatar Side */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 text-center md:border-r border-gray-200/60 md:pr-10 pt-4">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] mb-4">
              <img 
                src="/foto-pimpinan.jpg" 
                alt="Kepala Kemenag" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-base md:text-lg font-bold text-kemenag-green whitespace-nowrap">Bpk. H. Saefuddin, S.Ag., M.Pd.I.</p>
              <p className="text-gray-500 font-medium text-xs max-w-[200px] mx-auto mt-1">Kepala Kantor Kementerian Agama Kab. Cirebon</p>
            </div>
          </div>

          {/* Quote Side */}
          <div className="flex-1 flex flex-col justify-center text-center md:text-left relative py-4">
            <Quote className="absolute -top-2 -left-2 md:-left-6 w-12 h-12 text-kemenag-green opacity-10" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#0f2545] leading-relaxed md:leading-relaxed italic relative z-10 px-2 md:px-0">
              "Pelayanan publik di bidang agama bukanlah sekadar kewajiban administratif, melainkan pengabdian spiritual. Kita harus melayani dengan keikhlasan, mengayomi dengan kasih sayang, dan menuntun dengan keteladanan."
            </h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteSection;
