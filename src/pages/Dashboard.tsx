import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, BottomNavbar } from '../components';
import { api } from '../services/api';

export default function Dashboard() {
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  // Verify authentication on component mount without using Redux
  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // Use the api service to verify the token instead of direct fetch
        const result = await api.verifyToken();
        
        if (!result.isValid) {
          throw new Error('Authentication failed');
        }
        
        // Successfully verified authentication
        setIsVerifying(false);
      } catch (error) {
        console.error('Authentication verification error:', error);
        // If verification fails, redirect to login
        localStorage.removeItem('auth_token');
        navigate('/login');
      }
    };
    
    verifyAuthentication();
  }, [navigate]);

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0600ad]"></div>
        <p className="ml-3 text-gray-600">Memverifikasi sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Sidebar is now fixed positioned and full height */}
      <Sidebar />
      
      {/* Main content with left padding on desktop to accommodate fixed sidebar */}
      <div className="md:pl-64 min-h-screen flex flex-col">
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <div className="neu-flat-light p-6 rounded-2xl min-h-[calc(100vh-3rem)]">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Bottom navigation (mobile only) */}
      <BottomNavbar />
    </div>
  );
}
