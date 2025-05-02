/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { api } from '../services/api';
import { fetchUserData, setUserData, logout } from '../redux/features/authSlice';
import ButtonSpinner from '../components/ButtonSpinner/ButtonSpinner';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';
import { useLocation, useNavigate } from 'react-router-dom';

type ProfileFormData = {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

type UserInfoFormData = {
  nama_lengkap: string;
  tanggal_lahir: string;
  alamat_tempat_tinggal: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | 'Lainnya';
  foto_profile?: File | null;
};

interface LocationState {
  userId?: number;
  editMode?: boolean;
}

export default function Profile() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're editing another user's profile
  const locationState = location.state as LocationState;
  const editingUserId = locationState?.userId;
  const startInEditMode = locationState?.editMode;
  
  // Get current user data from Redux store
  const { userData: currentUserData, loading: currentUserLoading } = useAppSelector(state => state.auth);
  
  // Local state for the profile we're viewing/editing (could be current user or another user)
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    role: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading
  const [deleteError, setDeleteError] = useState<string | null>(null); // State for delete error
  
  // Additional info form state
  const [userInfoData, setUserInfoData] = useState<any>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [infoFormData, setInfoFormData] = useState<UserInfoFormData>({
    nama_lengkap: '',
    tanggal_lahir: '',
    alamat_tempat_tinggal: '',
    jenis_kelamin: 'Laki-laki',
    foto_profile: null
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [infoSuccessMessage, setInfoSuccessMessage] = useState<string | null>(null);
  const [infoErrorMessage, setInfoErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // File input ref for manual triggering
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine if we're editing our own profile or someone else's
  const isOwnProfile = !editingUserId || (currentUserData && editingUserId === currentUserData.id);
  
  // Check if current user can edit this profile
  const canEdit = () => {
    if (!currentUserData) return false;
    
    // Admin can edit any profile
    if (currentUserData.role === 'Admin') return true;
    
    // Users can only edit their own profile
    return isOwnProfile;
  };
  
  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      setProfileLoading(true);
      
      try {
        if (editingUserId && !isOwnProfile) {
          // Fetch the other user's data if we're not viewing our own profile
          const response = await api.getUserById(editingUserId);
          if (response && response.user) {
            setProfileData(response.user);
          } else {
            throw new Error('Failed to load user profile');
          }
        } else {
          // If viewing own profile, use current user data from Redux
          if (currentUserData) {
            setProfileData(currentUserData);
          } else if (!currentUserLoading) {
            // If current user data not available, fetch it
            dispatch(fetchUserData());
          }
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setErrorMessage(error.message || 'Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadProfileData();
  }, [editingUserId, isOwnProfile, currentUserData, currentUserLoading, dispatch]);
  
  // Update profile data when currentUserData changes (if viewing own profile)
  useEffect(() => {
    if (isOwnProfile && currentUserData) {
      setProfileData(currentUserData);
    }
  }, [isOwnProfile, currentUserData]);

  // Load user additional info when profile data is available
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!profileData?.id) return;
      
      setUserInfoLoading(true);
      try {
        const response = await api.getUserInfo(profileData.id);
        if (response) {
          setUserInfoData(response);
          setInfoFormData({
            nama_lengkap: response.nama_lengkap || '',
            tanggal_lahir: response.tanggal_lahir || '',
            alamat_tempat_tinggal: response.alamat_tempat_tinggal || '',
            jenis_kelamin: response.jenis_kelamin || 'Laki-laki',
            foto_profile: null
          });
          if (response.foto_profile_url) {
            setPreviewImage(response.foto_profile_url);
          }
        }
      } catch (error: any) {
        console.error('Error loading user info:', error);
        // Don't show error - might be first time user without additional info
      } finally {
        setUserInfoLoading(false);
      }
    };
    
    loadUserInfo();
  }, [profileData]);

  // Update form data when profileData changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        role: profileData.role || '',
      });
    }
  }, [profileData]);
  
  // Set edit mode if directed from Users page
  useEffect(() => {
    if (startInEditMode && canEdit()) {
      setIsEditing(true);
    }
  }, [startInEditMode, canEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInfoFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Update form state
      setInfoFormData(prev => ({
        ...prev,
        foto_profile: file
      }));
      
      // Create and set preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset form when cancelling edit
    if (isEditing && profileData) {
      setFormData({
        name: profileData.name,
        email: profileData.email,
        role: profileData.role || '',
      });
    }
    // Clear messages when toggling edit mode
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  const toggleEditInfo = () => {
    setIsEditingInfo(!isEditingInfo);
    // Reset form when cancelling edit
    if (isEditingInfo && userInfoData) {
      setInfoFormData({
        nama_lengkap: userInfoData.nama_lengkap || '',
        tanggal_lahir: userInfoData.tanggal_lahir || '',
        alamat_tempat_tinggal: userInfoData.alamat_tempat_tinggal || '',
        jenis_kelamin: userInfoData.jenis_kelamin || 'Laki-laki',
        foto_profile: null
      });
      // Reset preview to stored URL if exists
      setPreviewImage(userInfoData.foto_profile_url || null);
    }
    // Clear messages when toggling edit mode
    setInfoSuccessMessage(null);
    setInfoErrorMessage(null);
  };
  
  const handleBack = () => {
    navigate('/dashboard/users');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      if (!profileData || !profileData.id) {
        throw new Error('Profile data is missing');
      }
      
      // Use our api service with Axios to update the profile
      const response = await api.updateUserProfile(profileData.id, {
        ...formData,
        id: profileData.id
      });
      
      if (response && response.is_success && response.user) {
        // Update the profile data
        setProfileData(response.user);
        
        // If editing own profile, update Redux store with new data
        if (isOwnProfile) {
          dispatch(setUserData(response.user));
        }
        
        setSuccessMessage('Profil berhasil diperbarui');
        setIsEditing(false);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setErrorMessage(error.message || 'Gagal memperbarui profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData?.id) return;
    
    setIsSubmittingInfo(true);
    setInfoSuccessMessage(null);
    setInfoErrorMessage(null);
    
    try {
      // Create FormData for multipart/form-data (file upload)
      const formData = new FormData();
      formData.append('nama_lengkap', infoFormData.nama_lengkap);
      formData.append('tanggal_lahir', infoFormData.tanggal_lahir);
      formData.append('alamat_tempat_tinggal', infoFormData.alamat_tempat_tinggal);
      formData.append('jenis_kelamin', infoFormData.jenis_kelamin);
      
      // Only append file if it exists
      if (infoFormData.foto_profile) {
        formData.append('foto_profile', infoFormData.foto_profile);
      }
      
      const response = await api.saveUserInfo(profileData.id, formData);
      
      if (response && response.is_success) {
        setUserInfoData(response.data);
        setInfoSuccessMessage('Informasi tambahan berhasil disimpan');
        setIsEditingInfo(false);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      console.error('Info update error:', error);
      setInfoErrorMessage(error.message || 'Gagal menyimpan informasi tambahan');
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  // Handler for initiating account deletion
  const handleDeleteAccount = async () => {
    if (!profileData?.id) {
      setDeleteError('User ID tidak ditemukan. Tidak dapat menghapus akun.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await api.deleteUserAccount(profileData.id);
      
      // Check backend success flag
      if (response.is_success) {
        // Clear token from local storage
        localStorage.removeItem('auth_token');
        // Dispatch logout action to clear Redux state
        dispatch(logout());
        // Reload the page to redirect to login
        window.location.reload(); 
      } else {
        setDeleteError(response.message || 'Gagal menghapus akun.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      console.error('Delete account error:', err);
      setDeleteError(err.message || 'Terjadi kesalahan saat menghapus akun.');
      setIsDeleting(false);
    }
    // No finally block needed as success leads to reload
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button when viewing someone else's profile */}
      {!isOwnProfile && (
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-4 flex items-center neu-button px-4 py-2 rounded-lg text-gray-700"
        >
          <span className="mr-2">←</span>
          Kembali ke Daftar Pengguna
        </motion.button>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0600ad] to-[#0500c4]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 mt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isOwnProfile ? 'Profil Saya' : `Profil ${profileData?.name || 'Pengguna'}`}
            </h1>
            <p className="text-gray-600">
              {isOwnProfile 
                ? 'Kelola informasi akun Anda' 
                : `Mengelola informasi akun ${profileData?.name || 'pengguna'}`}
            </p>
          </div>
          
          {canEdit() && (
            <motion.button
              onClick={toggleEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mt-4 md:mt-0 ${isEditing 
                ? 'neu-button-outline text-gray-700 border border-gray-300' 
                : 'neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white'
              } px-4 py-2 rounded-lg font-medium flex items-center`}
              disabled={profileLoading}
            >
              <span className="mr-2">{isEditing ? '✕' : '✏️'}</span>
              {isEditing ? 'Batal' : 'Edit Profil'}
            </motion.button>
          )}
        </div>

        {profileLoading ? (
          <div className="flex flex-col space-y-6 mt-8">
            <div className="md:col-span-2 flex justify-center mb-4">
              <SkeletonLoader type="circle" width={96} height={96} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <SkeletonLoader type="rect" height={48} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <SkeletonLoader type="rect" height={48} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Peran</label>
                <SkeletonLoader type="rect" height={48} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Akun Dibuat</label>
                <SkeletonLoader type="rect" height={48} className="rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 neu-flat-light text-sm flex items-center"
              >
                <span className="mr-2">✅</span>
                {successMessage}
              </motion.div>
            )}
            
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 neu-flat-light text-sm flex items-center"
              >
                <span className="mr-2">⚠️</span>
                {errorMessage}
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Display */}
              <div className="md:col-span-2 flex justify-center">
                <div className="neu-card w-24 h-24 p-0.5 rounded-full flex items-center justify-center mb-3">
                  {profileData?.avatar ? (
                    <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-[#0600ad] rounded-full flex items-center justify-center text-3xl text-white font-bold">
                      {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`w-full bg-transparent border-none focus:outline-none ${isEditing ? 'text-gray-800' : 'text-gray-500'}`}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full bg-transparent border-none focus:outline-none ${isEditing ? 'text-gray-800' : 'text-gray-500'}`}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>
              
              {/* Role Display */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Peran
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <div className="text-gray-500 flex items-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      profileData?.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                      profileData?.role === 'Editor' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {profileData?.role || 'User'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Account Created */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Akun Dibuat
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <div className="text-gray-500">
                    {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </div>
                </div>
              </div>
            </div>
            
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-end"
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(6, 0, 173, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <ButtonSpinner size={16} color="white" className="mr-2" />
                      Memperbarui...
                    </div>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </motion.button>
              </motion.div>
            )}
          </form>
        )}
      </motion.div>
      
      {/* Additional Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-card p-6 md:p-8 mt-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0600ad] to-[#0500c4]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 mt-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Informasi Tambahan
            </h1>
            <p className="text-gray-600">
              Lengkapi informasi pribadi Anda
            </p>
          </div>
          
          {canEdit() && (
            <motion.button
              onClick={toggleEditInfo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mt-4 md:mt-0 ${isEditingInfo 
                ? 'neu-button-outline text-gray-700 border border-gray-300' 
                : 'neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white'
              } px-4 py-2 rounded-lg font-medium flex items-center`}
              disabled={userInfoLoading}
            >
              <span className="mr-2">{isEditingInfo ? '✕' : '✏️'}</span>
              {isEditingInfo ? 'Batal' : userInfoData ? 'Edit Informasi' : 'Tambah Informasi'}
            </motion.button>
          )}
        </div>

        {userInfoLoading ? (
          <div className="flex flex-col space-y-6 mt-8">
            <div className="space-y-2">
              <SkeletonLoader type="rect" height={48} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonLoader type="rect" height={48} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonLoader type="rect" height={100} className="rounded-xl" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitInfo}>
            {infoSuccessMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 neu-flat-light text-sm flex items-center"
              >
                <span className="mr-2">✅</span>
                {infoSuccessMessage}
              </motion.div>
            )}
            
            {infoErrorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 neu-flat-light text-sm flex items-center"
              >
                <span className="mr-2">⚠️</span>
                {infoErrorMessage}
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo Upload */}
              <div className="md:col-span-2 flex flex-col items-center mb-6">
                <div 
                  className="neu-card w-24 h-24 p-0.5 rounded-full flex items-center justify-center mb-3 relative overflow-hidden"
                  onClick={() => isEditingInfo && fileInputRef.current?.click()}
                  style={{ cursor: isEditingInfo ? 'pointer' : 'default' }}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xl text-gray-500 font-bold">
                      {userInfoData?.nama_lengkap ? userInfoData.nama_lengkap.charAt(0).toUpperCase() : 'F'}
                    </div>
                  )}
                  
                  {isEditingInfo && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white text-xs">Ubah Foto</span>
                    </div>
                  )}
                </div>
                
                {isEditingInfo && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-[#0600ad] hover:underline"
                    >
                      Pilih Foto Profil
                    </button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, atau GIF (maks. 2MB)</p>
                  </>
                )}
              </div>
              
              {/* Nama Lengkap Field */}
              <div className="space-y-2">
                <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    type="text"
                    className={`w-full bg-transparent border-none focus:outline-none ${isEditingInfo ? 'text-gray-800' : 'text-gray-500'}`}
                    value={infoFormData.nama_lengkap}
                    onChange={handleInfoChange}
                    disabled={!isEditingInfo}
                    required
                  />
                </div>
              </div>
              
              {/* Tanggal Lahir Field */}
              <div className="space-y-2">
                <label htmlFor="tanggal_lahir" className="block text-sm font-medium text-gray-700">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <input
                    id="tanggal_lahir"
                    name="tanggal_lahir"
                    type="date"
                    className={`w-full bg-transparent border-none focus:outline-none ${isEditingInfo ? 'text-gray-800' : 'text-gray-500'}`}
                    value={infoFormData.tanggal_lahir}
                    onChange={handleInfoChange}
                    disabled={!isEditingInfo}
                    required
                  />
                </div>
              </div>
              
              {/* Jenis Kelamin Field */}
              <div className="space-y-2">
                <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <select
                    id="jenis_kelamin"
                    name="jenis_kelamin"
                    className={`w-full bg-transparent border-none focus:outline-none ${isEditingInfo ? 'text-gray-800' : 'text-gray-500'}`}
                    value={infoFormData.jenis_kelamin}
                    onChange={handleInfoChange}
                    disabled={!isEditingInfo}
                    required
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              
              {/* Alamat Field */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="alamat_tempat_tinggal" className="block text-sm font-medium text-gray-700">
                  Alamat Tempat Tinggal <span className="text-red-500">*</span>
                </label>
                <div className="neu-flat-light p-4 rounded-xl">
                  <textarea
                    id="alamat_tempat_tinggal"
                    name="alamat_tempat_tinggal"
                    rows={4}
                    className={`w-full bg-transparent border-none focus:outline-none resize-none ${isEditingInfo ? 'text-gray-800' : 'text-gray-500'}`}
                    value={infoFormData.alamat_tempat_tinggal}
                    onChange={handleInfoChange}
                    disabled={!isEditingInfo}
                    required
                  />
                </div>
              </div>
            </div>
            
            {isEditingInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-end"
              >
                <motion.button
                  type="submit"
                  disabled={isSubmittingInfo}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(6, 0, 173, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isSubmittingInfo ? (
                    <div className="flex items-center">
                      <ButtonSpinner size={16} color="white" className="mr-2" />
                      Menyimpan...
                    </div>
                  ) : (
                    'Simpan Informasi'
                  )}
                </motion.button>
              </motion.div>
            )}
            
            {/* If no data exists and not editing, show message */}
            {!userInfoData && !isEditingInfo && (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">Anda belum menambahkan informasi tambahan.</p>
                <motion.button
                  type="button"
                  onClick={toggleEditInfo}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white px-4 py-2 rounded-lg text-sm"
                >
                  Tambah Informasi Sekarang
                </motion.button>
              </div>
            )}
          </form>
        )}
      </motion.div>
      
      {/* Security Section - Only show for own profile */}
      {isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neu-card p-6 md:p-8 mt-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0600ad] to-[#0500c4]"></div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-6 mt-2">Keamanan Akun</h2>
          
          <div className="space-y-6">
            <div className="p-4 neu-flat-light rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Kata Sandi</h3>
                  <p className="text-sm text-gray-500 mt-1">Ubah kata sandi untuk meningkatkan keamanan akun Anda</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="neu-button mt-3 md:mt-0 text-[#0600ad] font-medium px-4 py-2 rounded-lg text-sm"
                >
                  Ubah Kata Sandi
                </motion.button>
              </div>
            </div>
            
            <div className="p-4 neu-flat-light rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Verifikasi Dua Faktor</h3>
                  <p className="text-sm text-gray-500 mt-1">Menambahkan lapisan keamanan tambahan ke akun Anda</p>
                </div>
                <span className="mt-3 md:mt-0 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                  Segera Hadir
                </span>
              </div>
            </div>
            
            <div className="p-4 neu-flat-light rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Riwayat Login</h3>
                  <p className="text-sm text-gray-500 mt-1">Lihat aktivitas login akun Anda</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="neu-button mt-3 md:mt-0 text-[#0600ad] font-medium px-4 py-2 rounded-lg text-sm"
                >
                  Lihat Riwayat
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Account Section */}
      {isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 neu-card p-6 rounded-xl border border-red-200 bg-red-50/50"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-3">Hapus Akun</h3>
          <p className="text-sm text-red-700 mb-4">
            Tindakan ini tidak dapat diurungkan. Semua data Anda akan dihapus secara permanen.
          </p>
          <AnimatePresence>
            {deleteError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 text-red-700 text-sm"
              >
                {deleteError}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="neu-button-primary bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            disabled={isDeleting}
          >
            {isDeleting ? <ButtonSpinner size={18} color="white" className="mr-2" /> : null}
            Hapus Akun Saya
          </motion.button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)} // Close on backdrop click
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="neu-card bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Hapus Akun</h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  className="neu-button px-4 py-2 rounded-lg text-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Batal
                </motion.button>
                <motion.button
                  className="neu-button-primary bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? <ButtonSpinner size={20} color="white" className="mr-2" /> : null}
                  Ya, Hapus Akun
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
