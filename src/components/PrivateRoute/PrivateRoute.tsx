// filepath: d:\Applicant\my-app\src\components\PrivateRoute\PrivateRoute.tsx
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks'; // Import useAppSelector
import { logout, setUserData, loginSuccess } from '../../redux/features/authSlice'; // Import loginSuccess

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  // Get authentication state directly from Redux
  const { isAuthenticated: reduxIsAuthenticated, userData: reduxUserData } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  // Local state to manage verification process, especially for token checks
  const [isVerifying, setIsVerifying] = useState(!reduxIsAuthenticated); // Only verify if Redux state isn't already authenticated
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(reduxIsAuthenticated);

  useEffect(() => {
    // If Redux already says authenticated, no need for further verification here
    if (reduxIsAuthenticated) {
      setLocalIsAuthenticated(true);
      setIsVerifying(false);
      return;
    }

    // If Redux is not authenticated, check for a token (handles page refresh)
    const verifyTokenOnLoad = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLocalIsAuthenticated(false);
        setIsVerifying(false);
        // Ensure Redux state is also logged out if no token
        if (reduxIsAuthenticated) dispatch(logout()); 
        return;
      }
      
      // Token exists, but Redux state is not authenticated yet. Verify token.
      setIsVerifying(true); // Start verification
      try {
        const { isValid, userData } = await api.verifyToken();
        
        if (isValid && userData) {
          // If token is valid, update Redux store and local state
          dispatch(loginSuccess(userData.user || userData)); // Use loginSuccess to set isAuthenticated and userData
          setLocalIsAuthenticated(true);
        } else {
          // If token is invalid, clean up
          setLocalIsAuthenticated(false);
          localStorage.removeItem('auth_token');
          dispatch(logout());
        }
      } catch (error) {
        console.error('Token verification error in PrivateRoute:', error);
        setLocalIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        dispatch(logout());
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyTokenOnLoad();
    
  // Depend on reduxIsAuthenticated to re-run if login happens elsewhere
  }, [dispatch, reduxIsAuthenticated]); 
  
  // Show loading indicator while verifying (only if needed)
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0600ad]"></div>
        <p className="ml-3 text-gray-600">Memverifikasi akses...</p>
      </div>
    );
  }
  
  // Use the derived localIsAuthenticated state for redirection logic
  if (!localIsAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated (either via Redux initially or after token verification)
  // Ensure userData is available in Redux before rendering children that might depend on it
  if (!reduxUserData && localIsAuthenticated) {
     // This case might happen briefly if verifyToken was used. 
     // Show loading or wait for Redux state to catch up.
     // For simplicity, we can show the loader again, or trust that Sidebar's loader will handle it.
     return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0600ad]"></div>
        <p className="ml-3 text-gray-600">Memuat data pengguna...</p>
      </div>
    );
  }

  return <>{children}</>;
}