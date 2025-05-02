/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAppSelector } from '../redux/hooks';
import ButtonSpinner from '../components/ButtonSpinner/ButtonSpinner';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import { FormInput } from '../components';

// --- Re-introduce StatsCard ---
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  increase?: string;
  loading?: boolean;
}

const StatsCard = ({ title, value, icon, color, increase, loading }: StatsCardProps) => (
  <motion.div 
    className="neu-card p-6 rounded-xl relative overflow-hidden"
    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
  >
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}></div>
    
    {loading ? (
      <div className="space-y-3">
        <SkeletonLoader type="title" width={80} />
        <SkeletonLoader type="text" width={60} height={30} />
        <SkeletonLoader type="text" width={100} />
      </div>
    ) : (
      <>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color.replace('from-', 'bg-').split(' ')[0]} bg-opacity-15`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
        
        {increase && (
          <div className="text-xs font-medium">
            <span className="text-green-600">↑ {increase}</span>
            <span className="text-gray-500 ml-1">dari bulan lalu</span>
          </div>
        )}
      </>
    )}
  </motion.div>
);
// --- End StatsCard ---


// Define User type based on expected data
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  created_at?: string; // Optional: if available from backend
}

export default function Admin() {
  const { userData, loading: authLoading } = useAppSelector(state => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- State for Stats ---
  const [stats, setStats] = useState<any>({
    users: { count: 0, increase: '0%' },
    activeUsers: { count: 0, increase: '0%' },
    newUsers: { count: 0, increase: '0%' }, // Example: New users this month
    roles: { count: 0, increase: '0%' } // Example: Number of distinct roles
  });
  const [loadingStats, setLoadingStats] = useState(true);
  // --- End State for Stats ---

  // State for modals and forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // --- useEffect for Stats ---
  useEffect(() => {
    const fetchStats = async () => {
      if (userData?.role?.toLowerCase() === 'admin') {
        setLoadingStats(true);
        try {
          // Simulate API call or calculate from users data
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
          
          // Example calculation (replace with actual API call if available)
          const totalUsers = users.length; 
          // Mock other stats
          setStats({
            users: { count: totalUsers, increase: `${Math.floor(Math.random() * 10)}%` },
            activeUsers: { count: Math.floor(totalUsers * (0.6 + Math.random() * 0.3)), increase: `${Math.floor(Math.random() * 15)}%` },
            newUsers: { count: Math.floor(totalUsers * (0.05 + Math.random() * 0.1)), increase: `${Math.floor(Math.random() * 20)}%` },
            roles: { count: new Set(users.map(u => u.role)).size, increase: '0%' } 
          });

        } catch (err) {
          console.error("Error fetching/calculating stats:", err);
          // Optionally set an error state for stats
        } finally {
          setLoadingStats(false);
        }
      }
    };
    // Fetch stats only after users are loaded or if users change
    if (!loadingUsers && users.length > 0) {
       fetchStats();
    } else if (!loadingUsers && users.length === 0) {
       // Handle case with zero users
       setStats({ users: { count: 0, increase: '0%' }, activeUsers: { count: 0, increase: '0%' }, newUsers: { count: 0, increase: '0%' }, roles: { count: 0, increase: '0%' } });
       setLoadingStats(false);
    }
  }, [loadingUsers, users, userData]); // Depend on users data
  // --- End useEffect for Stats ---


  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch if the user is confirmed to be an admin
      if (userData?.role?.toLowerCase() === 'admin') {
        setLoadingUsers(true);
        setError(null);
        try {
          const fetchedUsers = await api.getUsers();
          setUsers(fetchedUsers);
        } catch (err: any) {
          setError(err.message || 'Gagal memuat daftar pengguna.');
        } finally {
          setLoadingUsers(false);
        }
      }
    };

    // Don't fetch until auth loading is done
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading, userData]); // Re-fetch if auth state changes

  // Check if user has admin permissions
  const isAdmin = userData?.role?.toLowerCase() === 'admin';

  // Handlers for Modals
  const openAddModal = () => {
    setFormData({ name: '', email: '', password: '', role: 'User' }); // Reset form
    setModalError(null);
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role }); // Pre-fill form, clear password
    setModalError(null);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setModalError(null);
    setShowDeleteConfirm(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setSelectedUser(null);
    setModalError(null);
    setIsSubmitting(false);
  };

  // Form change handler
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setModalError(null); // Clear error on change
  };

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      const newUserPayload: any = { 
        name: formData.name, 
        email: formData.email, 
        role: formData.role 
      };
      // Only include password if it's not empty
      if (formData.password) {
        newUserPayload.password = formData.password;
      }
      
      const response = await api.createUser(newUserPayload);
      setUsers(prev => [...prev, response.user]); // Add new user to the list
      closeModal();
    } catch (err: any) {
      setModalError(err.message || 'Gagal menambahkan pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    setModalError(null);
    try {
       const updatePayload: any = { 
        name: formData.name, 
        email: formData.email, 
        role: formData.role 
      };
      // Only include password if it's not empty
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await api.updateUserProfile(selectedUser.id, updatePayload);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? response.user : u)); // Update user in the list
      closeModal();
    } catch (err: any) {
      setModalError(err.message || 'Gagal memperbarui pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true); // Use isSubmitting for delete as well
    setModalError(null);
    try {
      await api.deleteUserByAdmin(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id)); // Remove user from the list
      closeModal();
    } catch (err: any) {
      setModalError(err.message || 'Gagal menghapus pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state during initial auth check
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <div className="flex flex-col items-center justify-center space-y-4">
          <ButtonSpinner size={32} color="#0600ad" />
          <p className="text-gray-600">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  // Access Denied view
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neu-card p-8 text-center bg-red-50"
        >
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
          <p className="text-gray-600 mb-6">Halaman ini hanya dapat diakses oleh Administrator.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white px-6 py-3 rounded-lg"
            onClick={() => window.history.back()}
          >
            Kembali
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main Admin Content (User Management Table)
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Manajemen Pengguna
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola pengguna aplikasi Anda.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white px-4 py-2 rounded-lg flex items-center"
            onClick={openAddModal}
          >
            <span className="mr-2">+</span> Tambah Pengguna
          </motion.button>
        </div>
      </motion.div>

      {/* --- Stats Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Pengguna" 
          value={stats.users.count} 
          icon="👥" 
          color="from-[#0600ad] to-[#0500c4]" 
          increase={stats.users.increase}
          loading={loadingStats || loadingUsers}
        />
        <StatsCard 
          title="Pengguna Aktif" // Example stat
          value={stats.activeUsers.count} 
          icon="✅" 
          color="from-green-500 to-green-600" 
          increase={stats.activeUsers.increase}
          loading={loadingStats || loadingUsers}
        />
        <StatsCard 
          title="Pengguna Baru" // Example stat
          value={stats.newUsers.count} 
          icon="✨" 
          color="from-purple-500 to-purple-600" 
          increase={stats.newUsers.increase}
          loading={loadingStats || loadingUsers}
        />
        <StatsCard 
          title="Jumlah Role" // Example stat
          value={stats.roles.count} 
          icon="🏷️" 
          color="from-amber-500 to-amber-600" 
          // increase={stats.roles.increase} // Increase might not make sense here
          loading={loadingStats || loadingUsers}
        />
      </div>
      {/* --- End Stats Section --- */}

      {error && (
        <div className="neu-card bg-red-50 text-red-700 p-6 rounded-lg text-center mb-8">
          <span className="text-xl">⚠️</span>
          <p className="mt-2">{error}</p>
        </div>
      )}

      <motion.div 
        className="neu-card p-4 sm:p-6 rounded-xl" // Apply neu-card to the container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Nama</th>
                <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                <th scope="col" className="px-6 py-4 font-semibold">Role</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Aksi</th> 
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 neu-flat-light-hover"> 
                    <td className="px-6 py-4"><SkeletonLoader type="text" /></td>
                    <td className="px-6 py-4"><SkeletonLoader type="text" /></td>
                    <td className="px-6 py-4"><SkeletonLoader type="text" width={50} /></td>
                    <td className="px-6 py-4 text-right"><SkeletonLoader type="text" width={80} /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                 <tr className="border-b border-gray-100">
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                      Tidak ada pengguna ditemukan.
                    </td>
                 </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 neu-flat-light-hover"> 
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap flex items-center">
                       <div className="w-8 h-8 rounded-full neu-flat-light overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#0600ad] font-bold">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      {user.name}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role.toLowerCase() === 'editor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="neu-button text-blue-600 px-3 py-1 rounded-md text-xs"
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`neu-button text-red-600 px-3 py-1 rounded-md text-xs ${user.id === userData?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => openDeleteConfirm(user)}
                        disabled={user.id === userData?.id} 
                      >
                        Hapus
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="neu-card bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">{showAddModal ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</h2>
              
              <form onSubmit={showAddModal ? handleAddUser : handleEditUser} className="space-y-4">
                {modalError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{modalError}</div>
                )}
                <FormInput label="Nama" id="name" name="name" type="text" value={formData.name} onChange={handleFormChange} required />
                <FormInput label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
                <FormInput label={`Password ${showAddModal ? '' : '(Kosongkan jika tidak ingin mengubah)'}`} id="password" name="password" type="password" value={formData.password} onChange={handleFormChange} required={showAddModal} />
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select 
                    id="role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0600ad] focus:border-[#0600ad]"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button type="button" onClick={closeModal} disabled={isSubmitting}
                    className="neu-button px-4 py-2 rounded-lg text-gray-700"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Batal
                  </motion.button>
                  <motion.button type="submit" disabled={isSubmitting}
                    className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white px-4 py-2 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isSubmitting ? <ButtonSpinner size={20} color="white" className="mr-2" /> : null}
                    {showAddModal ? 'Tambah' : 'Simpan'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="neu-card bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Hapus</h2>
              {modalError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{modalError}</div>
              )}
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus pengguna <span className="font-medium">{selectedUser.name}</span> ({selectedUser.email})? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button onClick={closeModal} disabled={isSubmitting}
                  className="neu-button px-4 py-2 rounded-lg text-gray-700"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Batal
                </motion.button>
                <motion.button onClick={handleDeleteUser} disabled={isSubmitting}
                  className="neu-button-primary bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {isSubmitting ? <ButtonSpinner size={20} color="white" className="mr-2" /> : null}
                  Ya, Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}