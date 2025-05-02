/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, JSX } from 'react'; // Import useEffect
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'; // Import Redux hooks
import { fetchUserData } from '../../redux/features/authSlice'; // Import fetchUserData
import SkeletonLoader from '../Skeleton/SkeletonLoader'; // Import SkeletonLoader
import ButtonSpinner from '../ButtonSpinner/ButtonSpinner';

type SidebarLinkProps = {
  to: string;
  icon: JSX.Element;
  label: string;
  isActive: boolean;
};

const SidebarLink = ({ to, icon, label, isActive }: SidebarLinkProps) => (
  <Link to={to}>
    <motion.div
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
        isActive 
          ? 'neu-pressed-light text-[#0600ad] font-medium bg-[#e8edff]' 
          : 'text-gray-700 hover:bg-gray-50 neu-button'
      }`}
      whileHover={{ x: isActive ? 0 : 4 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className={`text-xl ${isActive ? 'text-[#0600ad]' : 'text-gray-600'}`}>{icon}</div>
      <span>{label}</span>
      {isActive && (
        <motion.div 
          className="ml-auto w-2 h-10 bg-[#0600ad] rounded-full"
          layoutId="sidebar-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  </Link>
);

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get user data and loading state from Redux store
  const { userData, loading } = useAppSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Fetch user data if not already available and not currently loading
  useEffect(() => {
    if (!userData && !loading) {
      dispatch(fetchUserData());
    }
  }, [userData, loading, dispatch]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const success = await api.logoutUser();
      if (success) {
        // No need to navigate here, logoutUser reloads the page
      } else {
        console.error('Logout failed on server');
        // Force navigation if server logout fails but we want to clear client state
        localStorage.removeItem('auth_token'); // Ensure token is removed
        navigate('/login'); // Navigate to login
        window.location.reload(); // Force reload
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even on error
      localStorage.removeItem('auth_token'); // Ensure token is removed
      navigate('/login'); // Navigate to login
      window.location.reload(); // Force reload
    } finally {
        // Only set to false if logout didn't succeed and redirect
        if (!localStorage.getItem('auth_token')) {
             setIsLoggingOut(false);
        }
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname === path.replace(/\/$/, '');
  };

  // Check if the user is an admin (case-insensitive)
  const isAdmin = userData?.role?.toLowerCase() === 'admin';

  return (
    <div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-[#f0f4f8] z-20 p-6">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center py-6 mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-10 w-10 bg-gradient-to-br from-[#0600ad] to-[#0500c4] rounded-xl flex items-center justify-center mr-2 shadow-lg"
          >
            <span className="text-white font-bold">A</span>
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800">DashboardApp</h1>
        </div>
        
        <div className="neu-card p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0600ad] to-[#0500c4]"></div>
          <div className="flex items-center">
            {/* Skeleton for Avatar */}
            {loading ? (
              <div className="w-12 h-12 flex-shrink-0">
                <SkeletonLoader type="circle" width={48} height={48} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full neu-card flex items-center justify-center p-0.5 flex-shrink-0">
                {userData?.avatar ? (
                  <img 
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0600ad] to-[#0500c4] text-white flex items-center justify-center text-lg font-bold">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )}
            <div className="ml-3 overflow-hidden">
              {/* Skeleton for Name, Email, Role */}
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLoader type="text" width={80} height={14} />
                  <SkeletonLoader type="text" width={100} height={12} />
                  <SkeletonLoader type="text" width={50} height={10} />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-700 truncate" title={userData?.name}>
                    {userData?.name || ''}
                  </p>
                  <p className="text-xs text-gray-500 truncate" title={userData?.email}>{userData?.email || 'user@example.com'}</p>
                  {userData?.role && (
                    <span className="text-xs px-2 py-0.5 mt-1 inline-block rounded-full bg-[#0600ad]/10 text-[#0600ad] font-medium">
                      {userData.role}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <SidebarLink 
            to="/dashboard/weather" 
            icon={<span>☁️</span>} 
            label="Cek Cuaca" 
            isActive={isActive("/dashboard") || isActive("/dashboard/weather")}
          />
          <SidebarLink 
            to="/dashboard/profile" 
            icon={<span>👤</span>} 
            label="Profil Saya" 
            isActive={isActive("/dashboard/profile")}
          />
          {/* <SidebarLink 
            to="/dashboard/users" 
            icon={<span>👥</span>} 
            label="Daftar Pengguna" 
            isActive={isActive("/dashboard/users")}
          /> */}
          {/* Conditional rendering for Admin link based on loading state or user data */}
          {(loading || isAdmin) && ( // Use the isAdmin variable here
             loading ? (
                <div className="px-4 py-3 mb-2">
                    <SkeletonLoader type="rect" height={40}/>
                </div>
             ) : (
                // Only render the link if not loading AND the user is admin
                isAdmin && ( 
                  <SidebarLink
                    to="/dashboard/admin"
                    icon={<span>⚙️</span>}
                    label="Admin"
                    isActive={isActive("/dashboard/admin")}
                  />
                )
             )
          )}
        </nav>
        
        <div className="mt-auto">
          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl neu-button-primary bg-gradient-to-r from-red-500 to-red-600 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoggingOut ? (
              <>
                <ButtonSpinner size={20} color="white" className="mr-2" />
                <span>Keluar...</span>
              </>
            ) : (
              <>
                <span>🚪</span>
                <span>Keluar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
