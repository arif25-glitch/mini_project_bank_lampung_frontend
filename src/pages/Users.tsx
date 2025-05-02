/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppSelector } from '../redux/hooks';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import ButtonSpinner from '../components/ButtonSpinner/ButtonSpinner';

// User Skeleton Loader for the loading state
const UserSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="neu-card p-4 flex items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0600ad]/30 to-[#0500c4]/30"></div>
          
          <div className="w-12 h-12 rounded-full neu-flat-light overflow-hidden flex-shrink-0">
            <SkeletonLoader type="circle" width={48} height={48} />
          </div>
          
          <div className="ml-4 w-full">
            <SkeletonLoader type="title" width={120} className="mb-2" />
            <SkeletonLoader type="text" width={160} className="mb-2" />
            <SkeletonLoader type="text" width={80} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Users() {
  const navigate = useNavigate();
  const { userData } = useAppSelector(state => state.auth);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const usersData = await api.getUsers();
        setUsers(usersData);
      } catch (_) {
        setError('Gagal memuat daftar pengguna');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleUserClick = (user: any) => {
    setSelectedUser(user);
  };
  
  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const handleSendMessage = () => {
    setSendingMessage(true);
    // Simulate sending a message
    setTimeout(() => {
      setSendingMessage(false);
      handleCloseDetail();
    }, 1500);
  };
  
  // Can edit if current user is admin or if the profile belongs to the current user
  const canEditUser = (user: any) => {
    if (!userData) return false;
    
    // Admin can edit anyone
    if (userData.role === 'Admin') return true;
    
    // User can edit themselves
    return userData.id === user.id;
  };
  
  // Navigate to profile page and set it in edit mode
  const handleEditUser = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation(); // Prevent modal from opening
    navigate('/dashboard/profile', { state: { userId, editMode: true } });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Pengguna</h1>
      
      <div className="mb-6 neu-flat-light p-2 rounded-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg focus:outline-none neu-input"
            disabled={loading}
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            {loading ? <ButtonSpinner size={16} color="#9ca3af" /> : '🔍'}
          </div>
        </div>
      </div>
      
      {loading ? (
        <UserSkeletonLoader />
      ) : error ? (
        <div className="neu-card bg-red-50 text-red-700 p-6 rounded-lg text-center">
          <span className="text-xl">⚠️</span>
          <p className="mt-2">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-2 neu-card p-6 text-center">
              <p className="text-gray-500">Tidak ada pengguna yang ditemukan</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => handleUserClick(user)}
                className="neu-card p-4 cursor-pointer flex items-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0600ad]/30 to-[#0500c4]/30"></div>
                
                <div className="w-12 h-12 rounded-full neu-flat-light overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#0600ad] font-bold text-lg">{user.name.charAt(0)}</span>
                  )}
                </div>
                
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{user.name}</h3>
                    {canEditUser(user) && (
                      <motion.button
                        className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white text-xs px-2 py-1 rounded-md"
                        onClick={(e) => handleEditUser(e, user.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit
                      </motion.button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'Editor' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
      
      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="neu-card bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0600ad] to-[#0500c4]"></div>
              
              <div className="flex justify-between items-start mb-6 mt-2">
                <h2 className="text-xl font-bold text-gray-800">Detail Pengguna</h2>
                <motion.button 
                  onClick={handleCloseDetail}
                  className="neu-button h-8 w-8 flex items-center justify-center rounded-full text-gray-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="neu-card w-24 h-24 p-0.5 rounded-full flex items-center justify-center mb-3">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-[#0600ad] rounded-full flex items-center justify-center text-3xl text-white font-bold">
                      {selectedUser.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedUser.name}</h3>
                <span className="mt-1 px-3 py-1 bg-[#e8edff] text-[#0600ad] text-sm font-medium rounded-full">
                  {selectedUser.role}
                </span>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="neu-flat-light p-3 rounded-lg">
                  <span className="text-sm text-gray-500">Email</span>
                  <div className="font-medium text-gray-800">{selectedUser.email}</div>
                </div>
                
                <div className="neu-flat-light p-3 rounded-lg">
                  <span className="text-sm text-gray-500">ID Pengguna</span>
                  <div className="font-medium text-gray-800">#{selectedUser.id}</div>
                </div>
                
                <div className="neu-flat-light p-3 rounded-lg">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="font-medium text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Aktif
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-3">
                <motion.button
                  className="flex-1 px-4 py-3 neu-button rounded-lg font-medium text-gray-700"
                  onClick={handleCloseDetail}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={sendingMessage}
                >
                  Tutup
                </motion.button>
                
                {canEditUser(selectedUser) ? (
                  <motion.button
                    className="flex-1 px-4 py-3 neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(6, 0, 173, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUser(e, selectedUser.id);
                      handleCloseDetail();
                    }}
                  >
                    Edit Profil
                  </motion.button>
                ) : (
                  <motion.button
                    className="flex-1 px-4 py-3 neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(6, 0, 173, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? (
                      <span className="flex items-center justify-center">
                        <ButtonSpinner size={20} color="white" className="mr-2" />
                        Mengirim...
                      </span>
                    ) : (
                      'Kirim Pesan'
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
