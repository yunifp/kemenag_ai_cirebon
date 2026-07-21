import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { useOutletContext, useLocation } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useFetch } from '../../hooks/useFetch';

const UserManagement: React.FC = () => {
  const { menuItems } = useOutletContext<{ menuItems: any[] }>();
  const location = useLocation();
  
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', username: '', password: '', isActive: true });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: usersData, refetch: fetchUsers } = useFetch('/rbac/users');
  const { request } = useApi();

  const users = usersData?.data || [];

  const openAddModal = () => {
    setFormData({ id: '', name: '', email: '', username: '', password: '', isActive: true });
    setIsEditing(false);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setFormData({ id: user.id, name: user.name, email: user.email, username: user.username, password: '', isActive: user.isActive });
    setIsEditing(true);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isEditing ? `/rbac/users/${formData.id}` : '/rbac/users';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      // NOTE: for MVP, editing only updates status. 
      const body = isEditing ? { isActive: formData.isActive } : formData;
      await request(endpoint, {
        method,
        body
      });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error('Terjadi kesalahan!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus user ini secara permanen?')) return;
    try {
      await request(`/rbac/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const toggleStatus = async (user: any) => {
    try {
      await request(`/rbac/users/${user.id}`, {
        method: 'PUT',
        body: { isActive: !user.isActive }
      });
      fetchUsers();
    } catch (err) {
      toast.error('Gagal mengupdate status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Kelola Akun User</h1>
          <p className="text-sm text-gray-500">Manajemen akses dan status aktif untuk pengguna dashboard.</p>
        </div>
        {canCreate && (
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-green-700 rounded-xl font-semibold shadow-md transition-all text-sm">
            <Plus size={16} /> Tambah Akun
          </button>
        )}
      </div>

      <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="p-5 w-1/3">Nama Pengguna</th>
                <th className="p-5">Email</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-5 flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">@{user.username}</p>
                    </div>
                  </td>
                  <td className="p-5 text-gray-600">{user.email || '-'}</td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => canUpdate && toggleStatus(user)} 
                      disabled={!canUpdate}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${user.isActive ? 'text-green-700 bg-green-50 border-green-100 hover:bg-green-100' : 'text-gray-500 bg-gray-100 border-gray-200 hover:bg-gray-200'} ${!canUpdate && 'cursor-default'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span> {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Edit2 size={16} /></button>}
                      {canDelete && <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">{isEditing ? 'Ubah Role / Status Akun' : 'Tambah Akun Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                      <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none pr-10" />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </>
              )}
              {isEditing && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                  Mengedit akun: <strong>{formData.name}</strong> (@{formData.username})
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">
                  {isLoading && <Loader2 size={16} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
