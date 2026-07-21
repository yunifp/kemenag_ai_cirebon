import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, Clock, Plus, Edit2, Trash2, UploadCloud, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Modal } from '../../components/ui/modal';

const Dokumen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false); // Add Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const [isUploading, setIsUploading] = useState(false);
  
  // Modal Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: documentsData, refetch: fetchDocuments } = useFetch('/knowledge');
  const { request } = useApi();
  const documents = documentsData?.data || [];

  const filteredDocs = useMemo(() => {
    return documents.filter((doc: any) => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Pilih file terlebih dahulu');

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('file', file);
    formData.append('isPublic', isPublic.toString());

    try {
      const data = await request('/knowledge/upload', {
        method: 'POST',
        body: formData
      });
      
      toast.success(data.message || 'Dokumen berhasil diunggah dan diserap AI!');
      closeModal();
      fetchDocuments(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server');
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setCategory('');
    setFile(null);
    setIsPublic(false);
  };

  const handleDelete = (doc: any) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoc) return;
    try {
      await request(`/knowledge/${selectedDoc.id}`, {
        method: 'DELETE'
      });
      toast.success('Dokumen berhasil dihapus.');
      fetchDocuments(); // Refresh the list
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus dokumen. Pastikan backend mendukung endpoint DELETE /knowledge/:id');
    }
  };

  const handleEdit = (doc: any) => {
    setSelectedDoc(doc);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 pb-20">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dokumen Master</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola data dan dokumen pangkalan pengetahuan untuk QR-KDR chatbot.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-kemenag-green hover:bg-kemenag-dark text-white gap-2"
        >
          <Plus size={16} /> Tambah Dokumen
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan judul atau kategori..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-kemenag-green/20 focus:border-kemenag-green transition-all"
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="flex-1 overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Judul Dokumen</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Tipe</TableHead>
                <TableHead>Status AI</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                    Belum ada dokumen yang sesuai.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocs.map((doc: any, idx: number) => (
                  <TableRow key={doc.id || idx}>
                    <TableCell className="text-center text-gray-500">
                      {((currentPage - 1) * itemsPerPage) + idx + 1}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-gray-900">{doc.title}</p>
                      {doc.isPublic && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-100/50">
                          Publik
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">{doc.category}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md font-mono text-xs uppercase border border-gray-200">
                        {doc.fileType || 'PDF'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {doc.status === 'Ready' ? (
                        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit border border-green-100">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="font-semibold text-xs">Aktif</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit border border-amber-100">
                          <Clock size={14} className="text-amber-500 animate-spin-slow" />
                          <span className="font-semibold text-xs">Memproses</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => handleEdit(doc)}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(doc)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 text-sm text-gray-500">
          <div>
            Menampilkan {filteredDocs.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredDocs.length)} dari {filteredDocs.length} data
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            
            {totalPages > 0 ? (
              Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? 'bg-kemenag-green hover:bg-kemenag-dark text-white' : ''}
                >
                  {i + 1}
                </Button>
              ))
            ) : (
              <Button size="icon-sm" className="bg-kemenag-green text-white pointer-events-none">
                1
              </Button>
            )}

            <Button 
              variant="outline"
              size="icon-sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Add Document */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Tambah Dokumen Master"
        description="Unggah dokumen untuk melatih basis pengetahuan AI QR-KDR."
        icon={<Plus size={24} className="text-green-600" />}
      >
        <form onSubmit={handleUpload} className="flex flex-col">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Judul Dokumen</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: UU No.8 Tahun 2019" 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-kemenag-green focus:ring-4 focus:ring-kemenag-green/10 transition-all outline-none"
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Kategori Layanan</label>
              <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Haji & Umrah" 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-kemenag-green focus:ring-4 focus:ring-kemenag-green/10 transition-all outline-none"
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">File Dokumen</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors bg-white">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!file} 
                />
                <div className="pointer-events-none flex flex-col items-center gap-2">
                  <UploadCloud size={32} className={file ? "text-kemenag-green" : "text-gray-400"} />
                  {file ? (
                    <span className="font-medium text-green-700 text-sm">{file.name}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Klik atau seret file ke sini</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="isPublic" 
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                />
              </div>
              <label htmlFor="isPublic" className="text-sm text-gray-700 cursor-pointer font-medium leading-tight flex-1">
                Jadikan Dokumen Publik <br/>
                <span className="text-xs text-gray-500 font-normal">Tampil di portal PPID warga & bisa diunduh bebas.</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline"
              onClick={closeModal}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading} 
              className={isUploading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-kemenag-green hover:bg-kemenag-dark text-white'}
            >
              {isUploading ? 'Memproses...' : 'Simpan & Latih AI'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Dokumen Master"
        description="Perbarui judul dan kategori dokumen."
        icon={<Edit2 size={24} className="text-blue-600" />}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen</label>
            <input 
              type="text" 
              defaultValue={selectedDoc?.title} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kemenag-green/20 focus:border-kemenag-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input 
              type="text" 
              defaultValue={selectedDoc?.category} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kemenag-green/20 focus:border-kemenag-green"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
          <Button className="bg-kemenag-green hover:bg-kemenag-dark text-white" onClick={() => setIsEditModalOpen(false)}>Simpan Perubahan</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        description={`Apakah Anda yakin ingin menghapus dokumen "${selectedDoc?.title}" dari sistem dan memori AI?`}
        icon={<AlertTriangle size={24} className="text-red-500" />}
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Ya, Hapus Data & AI</Button>
        </div>
      </Modal>

    </div>
  );
};

export default Dokumen;
