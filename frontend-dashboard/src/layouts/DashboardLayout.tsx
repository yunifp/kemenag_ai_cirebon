import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, MessageSquareText, QrCode, Settings as SettingsIcon, Menu, Bell, ChevronRight, FileText, Image } from 'lucide-react';
import { io } from 'socket.io-client';
import { useFetch } from '../hooks/useFetch';

const iconMap: Record<string, React.ReactNode> = {
  'LayoutDashboard': <LayoutDashboard size={20} />,
  'Database': <Database size={20} />,
  'MessageSquareText': <MessageSquareText size={20} />,
  'QrCode': <QrCode size={20} />,
  'SettingsIcon': <SettingsIcon size={20} />,
  'FileText': <FileText size={20} />,
  'Image': <Image size={20} />
};


const MENU_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { 
    id: 'master-data', 
    name: 'Master Data', 
    path: '/dashboard/master-data', 
    icon: 'Database',
    children: [
      { id: 'dokumen', name: 'Dokumen', path: '/dashboard/master-data/dokumen' }
    ]
  },
  { id: 'tickets', name: 'Ticketing (CS)', path: '/dashboard/tickets', icon: 'MessageSquareText' },
  { id: 'whatsapp', name: 'Koneksi WA', path: '/dashboard/whatsapp', icon: 'QrCode' },
  { 
    id: 'settings', 
    name: 'Pengaturan Sistem', 
    path: '/dashboard/settings', 
    icon: 'SettingsIcon',
    children: [
      { id: 'users', name: 'Kelola Pengguna', path: '/dashboard/settings/users' }
    ]
  },
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [openMenuIds, setOpenMenuIds] = useState<Record<string, boolean>>({});

  const { data: notifData } = useFetch('/notifications');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = (id: string) => {
    setOpenMenuIds(prev => ({ ...prev, [id]: !prev[id] }));
  };



  useEffect(() => {
    if (MENU_ITEMS.length > 0) {
      const initialOpenState: Record<string, boolean> = {};
      MENU_ITEMS.forEach((item: any) => {
        if (item.children && item.children.length > 0) {
          if (location.pathname.startsWith(item.path)) {
            initialOpenState[item.id] = true;
          }
        }
      });
      setOpenMenuIds(initialOpenState);
    }
  }, [location.pathname]);
  useEffect(() => {
    if (notifData?.data) {
      const unread = notifData.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifData]);

  useEffect(() => {
    // Socket & Notifications
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');
    socket.on('new_notification', () => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-all">
        <div className="flex items-center gap-3 p-6 border-b border-gray-50">
          <img src="/logo.webp" alt="Logo Kemenag" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="font-bold text-lg text-gray-900 leading-tight">⛶ QR-KDR</h2>
            <p className="text-xs text-gray-500 font-medium">Kementerian Agama RI</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {MENU_ITEMS.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-4">Belum ada akses menu</p>
          ) : (
            MENU_ITEMS.map((item: any) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive = location.pathname === item.path || (hasChildren && location.pathname.startsWith(item.path));
              const isOpen = openMenuIds[item.id] || false;

              if (hasChildren) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => {
                        toggleMenu(item.id);
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive || isOpen
                          ? 'bg-green-50 text-green-700 shadow-sm border border-green-100/50' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${isActive || isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                          {item.icon ? iconMap[item.icon] : <LayoutDashboard size={20} />}
                        </div>
                        {item.name}
                      </div>
                      <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90 text-green-600' : 'text-gray-400'}`}>
                        <ChevronRight size={18} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="pl-11 pr-2 py-1 space-y-1">
                        {item.children?.map((child: any) => {
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.id}
                              to={child.path}
                              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isChildActive 
                                  ? 'bg-green-100/50 text-green-700 font-bold shadow-sm' 
                                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-50 text-green-700 shadow-sm border border-green-100/50' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.icon ? iconMap[item.icon] : <LayoutDashboard size={20} />}
                  </div>
                  {item.name}
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
              {MENU_ITEMS.find((i: any) => i.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-5">
            <Link to="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-green-600 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group relative">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">Admin Pusat</p>
                <p className="text-xs text-gray-500">Superadmin</p>
              </div>
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden z-50">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/30 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet context={React.useMemo(() => ({ menuItems: MENU_ITEMS }), [])} />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay (Simple) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white p-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-6 px-4 pt-2">Menu QR-KDR</h2>
            {MENU_ITEMS.map((item: any) => (
              <React.Fragment key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 mb-1 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 font-bold"
                >
                  {item.name}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="pl-6 pr-2 mb-2">
                    {item.children.map((child: any) => (
                      <Link
                        key={child.id}
                        to={child.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 mt-1 rounded-lg text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 font-medium"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
