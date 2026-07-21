import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, UserCircle2, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const Ticketing: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { request } = useApi();

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket.id);
      const interval = setInterval(() => fetchMessages(activeTicket.id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeTicket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      const data = await request('/tickets');
      setTickets(data.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const data = await request(`/tickets/${ticketId}/messages`);
      setMessages(data.data?.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    try {
      await request('/tickets/reply', {
        method: 'POST',
        body: {
          sessionId: activeTicket.id,
          message: replyText
        }
      });
      setReplyText('');
      fetchMessages(activeTicket.id);
    } catch (err) {
      console.error('Failed to reply', err);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    try {
      await request(`/tickets/${activeTicket.id}/close`, {
        method: 'POST',
      });
      setActiveTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Failed to close ticket', err);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
      
      {/* Sidebar: Ticket List */}
      <div className={`w-full md:w-1/3 border-r border-gray-100 flex-col bg-gray-50/50 ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-green-600" size={20}/>
            Inbox Warga
          </h2>
          <p className="text-xs text-gray-500 mt-1">Chat yang dialihkan dari Bot AI</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tickets.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
              <p>Tidak ada antrean tiket saat ini.</p>
            </div>
          ) : (
            tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => setActiveTicket(t)}
                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                  activeTicket?.id === t.id 
                    ? 'bg-green-50 border-green-200 shadow-sm' 
                    : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold ${activeTicket?.id === t.id ? 'text-green-800' : 'text-gray-900'}`}>
                    {t.phoneNumber}
                  </h4>
                  <span className="text-xs text-gray-400">{formatTime(t.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    t.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/30 ${activeTicket ? 'flex' : 'hidden md:flex'}`}>
        {activeTicket ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-100 bg-white/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-1.5 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setActiveTicket(null)}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeTicket.phoneNumber}</h3>
                  <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Menunggu balasan CS
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-gray-600">
                  <Phone size={14}/> Hubungi
                </Button>
                <Button 
                  onClick={handleCloseTicket}
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Tutup Tiket
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderType === 'USER' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm relative ${
                    msg.senderType === 'USER' 
                      ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
                      : 'bg-green-600 text-white rounded-tr-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] block mt-1.5 text-right ${
                      msg.senderType === 'USER' ? 'text-gray-400' : 'text-green-200'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleReply} className="flex gap-2 items-end">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ketik balasan untuk warga..."
                  className="flex-1 min-h-[50px] max-h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 resize-none transition-all text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-colors flex-shrink-0"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 mt-2 text-center">Tekan Enter untuk mengirim, Shift + Enter untuk baris baru.</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-gray-400 p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Pusat Bantuan Masyarakat</h3>
            <p className="text-sm text-center max-w-sm">Pilih tiket di sebelah kiri untuk mulai membalas pesan warga yang diteruskan dari Bot AI.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticketing;
