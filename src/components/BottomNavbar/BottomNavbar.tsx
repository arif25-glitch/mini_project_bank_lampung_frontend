import { useState, useEffect, JSX } from 'react'; // Added JSX type
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'; // Import Redux hooks
import { fetchUserData } from '../../redux/features/authSlice'; // Import fetchUserData
import ButtonSpinner from '../ButtonSpinner/ButtonSpinner'; // Import ButtonSpinner for logout
import SkeletonLoader from '../Skeleton/SkeletonLoader'; // Import SkeletonLoader

// Define type for BottomNavLink props
type BottomNavLinkProps = {
  to: string;
  icon: JSX.Element;
  label: string;
  isActive: boolean;
};

const BottomNavLink = ({ to, icon, label, isActive }: BottomNavLinkProps) => (
  <Link to={to} className="flex-1">
    <motion.div
      className={`flex flex-col items-center justify-center p-2 rounded-lg ${
        isActive 
          ? 'text-[#0600ad] bg-[#e8edff] neu-pressed-light' 
          : 'text-gray-600 hover:bg-gray-50/50'
      }`}
      whileTap={{ scale: 0.9 }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </motion.div>
  </Link>
);

export default function BottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get user data and loading state from Redux
  const { userData, loading } = useAppSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user data via Redux if needed
  useEffect(() => {
    if (!userData && !loading) {
      dispatch(fetchUserData());
    }
  }, [userData, loading, dispatch]);

  const handleLogout = async () => {
    setIsLoggingOut(true); // Set loading state
    try {
      const success = await api.logoutUser();
      if (success) {
        // logoutUser reloads the page, no further action needed
      } else {
        // Handle server-side logout failure (rare)
        console.error('Logout failed on server');
        localStorage.removeItem('auth_token');
        navigate('/login');
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force cleanup and redirect even on error
      localStorage.removeItem('auth_token');
      navigate('/login');
      window.location.reload();
    } 
    // No finally needed as success/error leads to reload
  };
  
  const isActive = (path: string) => {
    // Handle index route ('/dashboard') matching '/dashboard/weather'
    if (path === "/dashboard/weather") {
       return location.pathname === "/dashboard" || location.pathname === "/dashboard/weather";
    }
    return location.pathname === path || location.pathname === path.replace(/\/$/, '');
  };

  // Check if the user is an admin (case-insensitive)
  const isAdmin = userData?.role?.toLowerCase() === 'admin';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#f0f4f8] pb-3 pt-3 px-3">
      <div className="neu-card flex items-center justify-around p-2 rounded-xl space-x-1">
        <BottomNavLink 
          to="/dashboard/weather" 
          icon={<span>☁️</span>} 
          label="Cuaca" 
          isActive={isActive("/dashboard/weather")} 
        />
        
        <BottomNavLink 
          to="/dashboard/profile" 
          icon={<span>👤</span>} 
          label="Profil" 
          isActive={isActive("/dashboard/profile")} 
        />
        
        {/* Conditionally render Admin link */}
        {(loading || isAdmin) && (
          loading ? (
            // Skeleton Loader for Admin link
            <div className="flex-1 flex flex-col items-center justify-center p-2">
               <SkeletonLoader type="circle" width={24} height={24} className="mb-1"/>
               <SkeletonLoader type="text" width={30} height={10}/>
            </div>
          ) : (
            // Render Admin link only if user is admin
            isAdmin && (
              <BottomNavLink 
                to="/dashboard/admin" 
                icon={<span>⚙️</span>} 
                label="Admin" 
                isActive={isActive("/dashboard/admin")} 
              />
            )
          )
        )}
        
        {/* Logout Button */}
        <div className="flex-1">
          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex flex-col items-center justify-center p-2 w-full text-red-500 hover:bg-red-50/50 rounded-lg"
            whileTap={{ scale: 0.9 }}
          >
            {isLoggingOut ? (
               <ButtonSpinner size={24} color="red" />
            ) : (
               <span className="text-xl">🚪</span>
            )}
            <span className="text-xs mt-1 font-medium">Keluar</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
