import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ShieldCheck, ScanLine, AlertCircle, Smartphone } from 'lucide-react';

const WhatsApp: React.FC = () => {
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/whatsapp/qr');
        const data = await res.json();
        
        setStatus(data.status);
        if (data.qr) {
          setQrCode(data.qr);
        } else {
          setQrCode('');
        }
      } catch (e) {
        console.error('Failed to fetch QR');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Koneksi WhatsApp</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Tautkan nomor WhatsApp resmi untuk mulai melayani warga menggunakan asisten AI otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Connection Status Card */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
            <div className="p-8">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Status Sistem</h3>
              
              {status === 'CONNECTED' ? (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 relative">
                    <ShieldCheck size={32} className="text-green-600 relative z-10" />
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <h4 className="text-xl font-bold text-green-900 mb-2">Terhubung!</h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Sistem QR-KDR telah tersambung dengan sukses dan kini aktif membalas pesan warga secara otomatis.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 relative">
                    <AlertCircle size={32} className="text-red-600 relative z-10" />
                  </div>
                  <h4 className="text-xl font-bold text-red-900 mb-2">Terputus</h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Tidak ada nomor WhatsApp yang terhubung. Silakan pindai kode QR untuk mengaktifkan bot kembali.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone size={18} className="text-gray-500"/>
                Petunjuk Penautan:
              </h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-5">
                <li>Buka aplikasi WhatsApp di HP Anda.</li>
                <li>Ketuk ikon titik tiga (Android) atau Pengaturan (iPhone).</li>
                <li>Pilih <b>Perangkat Tertaut</b> (Linked Devices).</li>
                <li>Ketuk <b>Tautkan Perangkat</b> lalu arahkan kamera ke layar.</li>
              </ol>
            </div>
          </Card>
        </div>

        {/* QR Scanner Area */}
        <div className="md:col-span-7">
          <Card className="h-full border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-gray-900 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
            
            <div className="p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
              {status === 'CONNECTED' ? (
                <div className="text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <ShieldCheck size={48} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Perangkat Tertaut</h3>
                  <p className="text-gray-400 max-w-sm">Anda tidak perlu memindai QR code lagi. Sistem sedang berjalan di latar belakang.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative bg-white p-4 rounded-3xl shadow-2xl mb-8 group overflow-hidden">
                    {qrCode ? (
                      <>
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain rounded-xl relative z-10" />
                        {/* Animated Scanning Line */}
                        <div className="absolute top-4 left-4 right-4 h-1 bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20 animate-scan-line rounded-full"></div>
                      </>
                    ) : (
                      <div className="w-64 h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                        <ScanLine size={32} className="text-gray-400 mb-3 animate-pulse" />
                        <span className="text-gray-500 font-medium font-mono">MEMUAT QR...</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">Pindai untuk Mengaktifkan</h3>
                  <p className="text-gray-400 text-center text-sm max-w-xs">
                    Pastikan koneksi internet stabil. QR Code akan otomatis berganti setiap 20 detik jika belum dipindai.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default WhatsApp;
