import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Database, TrendingUp, Clock, Bot } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const Overview: React.FC = () => {
  const [stats, setStats] = useState({
    totalChats: 0,
    aiResolved: 0,
    handoffs: 0,
    totalDocs: 0
  });

  const { data: statsData } = useFetch('/public/stats');

  useEffect(() => {
    if (statsData?.data) {
      setStats(statsData.data);
    }
  }, [statsData]);

  const aiPercentage = stats.totalChats > 0 
    ? Math.round((stats.aiResolved / stats.totalChats) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Statistik</h1>
        <p className="text-gray-500 text-lg">
          Pantau performa AI QR-KDR dan aktivitas interaksi masyarakat hari ini.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 rounded-3xl border-0 shadow-lg shadow-gray-200/50 flex flex-col justify-between bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full mix-blend-multiply blur-2xl opacity-50 group-hover:bg-green-200 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mt-3">Total Chat Warga</h3>
            <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalChats.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg shadow-gray-200/50 flex flex-col justify-between bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply blur-2xl opacity-50 group-hover:bg-blue-200 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Bot size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" /> +5%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mt-3">Diselesaikan oleh AI</h3>
            <p className="text-3xl font-black text-gray-900 mt-1">
              {stats.aiResolved.toLocaleString()} <span className="text-sm font-medium text-gray-400">/ {aiPercentage}%</span>
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg shadow-gray-200/50 flex flex-col justify-between bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full mix-blend-multiply blur-2xl opacity-50 group-hover:bg-orange-200 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" /> +2%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mt-3">Tiket CS (Handoff)</h3>
            <p className="text-3xl font-black text-gray-900 mt-1">{stats.handoffs.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg shadow-gray-200/50 flex flex-col justify-between bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full mix-blend-multiply blur-2xl opacity-50 group-hover:bg-indigo-200 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Database size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mt-3">Dokumen Knowledge</h3>
            <p className="text-3xl font-black text-gray-900 mt-1">
              {stats.totalDocs.toLocaleString()} <span className="text-sm font-medium text-gray-400">file</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Area (Dummy Visuals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 rounded-3xl border-0 shadow-lg shadow-gray-200/50 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Tren Interaksi (7 Hari Terakhir)</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 110, 85].map((height, i) => (
              <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110" 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-400 mt-4 px-2">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>
        </Card>

        <Card className="p-8 rounded-3xl border-0 shadow-lg shadow-gray-200/50 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Aktivitas Terkini</h3>
          <div className="space-y-6">
            {[
              { text: "Bot berhasil menjawab pertanyaan syarat haji.", time: "2 mnt lalu", color: "bg-green-100 text-green-600" },
              { text: "Tiket #1042 ditutup oleh CS Admin.", time: "15 mnt lalu", color: "bg-blue-100 text-blue-600" },
              { text: "Dokumen 'Aturan Zakat 2024' diserap AI.", time: "1 jam lalu", color: "bg-purple-100 text-purple-600" },
              { text: "Warga meminta bantuan manusia (Handoff).", time: "3 jam lalu", color: "bg-orange-100 text-orange-600" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${item.color.split(' ')[1].replace('text', 'bg')}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{item.text}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock size={12} /> {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Overview;
