import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-kemenag-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-kemenag-yellow/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl w-full bg-white rounded-3xl p-10 md:p-14 text-center shadow-xl border border-gray-100 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
        >
          <img 
            src="/logo.webp" 
            alt="Logo Kemenag" 
            className="w-24 h-24 mx-auto mb-8 drop-shadow-md"
          />
        </motion.div>
        
        <h1 className="text-7xl md:text-9xl font-black text-kemenag-dark mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau Anda salah memasukkan alamat URL.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 rounded-full flex items-center justify-center gap-2 bg-slate-100 text-gray-600 font-bold hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-3 rounded-full flex items-center justify-center gap-2 bg-kemenag-green text-white font-bold hover:bg-kemenag-dark transition-colors shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" /> Beranda Utama
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
