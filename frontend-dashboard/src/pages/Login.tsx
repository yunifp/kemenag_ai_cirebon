import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CanvasCaptcha, { type CanvasCaptchaRef } from '../components/CanvasCaptcha';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const captchaRef = useRef<CanvasCaptchaRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaRef.current?.validate(captchaInput)) {
      setError('Kode keamanan salah, silakan coba lagi.');
      captchaRef.current?.refresh();
      setCaptchaInput('');
      return;
    }
    
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login gagal.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left Side - Visual Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 C30,40 70,60 100,0 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)"/>
            <path d="M0,100 C40,70 60,30 100,100 Z" fill="rgba(255,255,255,0.1)"/>
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white w-full h-full">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.3)] border border-white/50 p-2 overflow-hidden">
            <img src="/logo.webp" alt="Logo Kemenag" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Pusat Kendali <br/>
            <span className="text-green-300">⛶ QR-KDR</span>
          </h1>
          <p className="text-green-100 text-lg max-w-md leading-relaxed">
            Quick Response Kapabel Dinamis dan Religious Kabupaten Cirebon. Kelola basis pengetahuan AI, pantau interaksi, dan tangani pengaduan warga secara terpadu.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50/50 relative">
        {/* Background blobs for right side */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10"></div>

        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm p-1">
              <img src="/logo.webp" alt="Logo Kemenag" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
            <p className="text-gray-500">Masuk untuk mengelola sistem QR-KDR.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Pegawai / Username</label>
              <input 
                id="email" 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kemenag.go.id" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-gray-900"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-green-600 hover:text-green-700 font-medium">Lupa password?</a>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-gray-900 pr-12"
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Kode Keamanan</label>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 pt-1">
                  <CanvasCaptcha ref={captchaRef} />
                </div>
                <input 
                  type="text" 
                  placeholder="KETIK KODE DI KIRI" 
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all mt-1"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3.5 bg-gray-900 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Memeriksa...' : 'Masuk ke Dashboard'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Kementerian Agama RI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
