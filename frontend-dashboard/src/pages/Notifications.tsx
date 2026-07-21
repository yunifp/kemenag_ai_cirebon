import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Bell, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notifications');
      const data = await res.json();
      if (data.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Bell className="text-green-600" /> Notifikasi Sistem
        </h1>
        <p className="text-sm text-gray-500">Pemberitahuan aktivitas penting dan tiket bantuan dari WhatsApp.</p>
      </div>

      <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <Bell size={48} className="text-gray-200 mb-4" />
            <p className="font-semibold text-gray-700">Belum ada notifikasi.</p>
            <p className="text-sm mt-1">Anda sudah membaca semua pemberitahuan.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-5 flex items-start justify-between gap-4 transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-green-50/20' : ''}`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</h3>
                    <p className={`text-sm mt-0.5 ${!notif.isRead ? 'text-gray-600' : 'text-gray-400'}`}>{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Tandai Dibaca
                    </button>
                  )}
                  {notif.link && (
                    <Link to={notif.link} className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1">
                      Lihat Tiket <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
