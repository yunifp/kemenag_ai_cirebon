import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#032314] text-white pt-16 pb-8 border-t-[6px] border-[#f4d03f]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
        >
          
          {/* Column 1: Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-full p-1.5 flex items-center justify-center">
                <img src="/logo.webp" alt="Logo Kemenag" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-[#f4d03f]">
                  Kementerian Agama
                </span>
                <span className="font-medium text-sm text-gray-200">
                  Kabupaten Cirebon
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Melayani masyarakat dengan ikhlas, mewujudkan tata kelola pemerintahan yang baik, dan meningkatkan kualitas kerukunan umat beragama di Kabupaten Cirebon.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f4d03f] hover:text-kemenag-dark transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f4d03f] hover:text-kemenag-dark transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f4d03f] hover:text-kemenag-dark transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f4d03f] hover:text-kemenag-dark transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </motion.div>

          {/* Column 2: Tautan Cepat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-6 text-[#f4d03f] relative inline-block">
              Tautan Cepat
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-white/20 rounded-full"></span>
            </h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/profil/visi-misi" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Visi & Misi</Link></li>
              <li><Link to="/profil/struktur" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Struktur Organisasi</Link></li>
              <li><Link to="/dokumen" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Dokumen Publik</Link></li>
              <li><Link to="/berita" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Berita Terkini</Link></li>
              <li><Link to="/kontak" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Pengaduan Masyarakat</Link></li>
            </ul>
          </motion.div>

          {/* Column 3: Layanan Kami */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-6 text-[#f4d03f] relative inline-block">
              Layanan Kami
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-white/20 rounded-full"></span>
            </h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/layanan/haji" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Pendaftaran Haji</Link></li>
              <li><Link to="/layanan/nikah" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Pencatatan Nikah</Link></li>
              <li><Link to="/layanan/halal" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Sertifikasi Halal</Link></li>
              <li><Link to="/layanan/pesantren" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Izin Ponpes</Link></li>
              <li><Link to="/layanan/zakat" className="text-gray-300 hover:text-white hover:translate-x-1 transition-transform inline-block">Zakat & Wakaf</Link></li>
            </ul>
          </motion.div>

          {/* Column 4: Kontak Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-6 text-[#f4d03f] relative inline-block">
              Hubungi Kami
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-white/20 rounded-full"></span>
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 flex-shrink-0 text-[#f4d03f] mt-0.5" />
                <span className="text-sm leading-relaxed">
                  Jl. Sunan Drajat No.12, Sumber, Kec. Sumber, Kabupaten Cirebon, Jawa Barat 45611
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 flex-shrink-0 text-[#f4d03f]" />
                <span className="text-sm">(0231) 321234</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 flex-shrink-0 text-[#f4d03f]" />
                <span className="text-sm">kab.cirebon@kemenag.go.id</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-gray-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} Kementerian Agama Kabupaten Cirebon. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
