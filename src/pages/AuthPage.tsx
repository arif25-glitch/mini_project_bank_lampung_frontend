/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormInput, PasswordStrength, WavyGradientBackground } from '../components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  setIsLogin, 
  updateFormData, 
  loginSuccess,
  logout,
} from '../redux/features/authSlice';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ButtonSpinner from '../components/ButtonSpinner/ButtonSpinner';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLogin, formData, isAuthenticated } = useAppSelector((state) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true); // Keep track of initial verification
  const [isLoading, setIsLoading] = useState(false); // Use isLoading for form submission
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Effect for initial token verification
  useEffect(() => {
    const verifyExistingAuth = async () => {
      setIsVerifying(true);
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Use fetchUserData thunk which handles setting user data in Redux
          // Or keep verifyToken if it returns necessary data immediately
          const { isValid, userData } = await api.verifyToken(); 
          
          if (isValid && userData) {
            // Dispatch user data if verification is successful
            dispatch(loginSuccess(userData.user || userData)); // Adjust based on verifyToken response structure
            // No navigation here yet, let the next effect handle it
          } else {
            localStorage.removeItem('auth_token');
            dispatch(logout());
          }
        } catch (error) {
          console.error('Authentication verification error:', error);
          localStorage.removeItem('auth_token');
          dispatch(logout());
        }
      }
      setIsVerifying(false);
    };
    
    verifyExistingAuth();
  }, [dispatch]); // Only run on mount
  
  // Effect for redirecting after authentication state changes (and verification is done)
  useEffect(() => {
    if (isAuthenticated && !isVerifying) {
      navigate('/dashboard', { replace: true }); // Use replace to avoid back button going to login
    }
  }, [isAuthenticated, navigate, isVerifying]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);
    // Use isLoading for the button state, formSubmitted might be redundant now
    setIsLoading(true); 
    
    try {
      let response;
      if (isLogin) {
        const loginErrors = validateLoginForm();
        if (loginErrors) {
          setError(loginErrors);
          setIsLoading(false);
          return;
        }
        response = await api.loginUser(formData.email, formData.password);
      } else {
        const registerErrors = validateRegisterForm();
        if (registerErrors) {
          setError(registerErrors);
          setIsLoading(false);
          return;
        }
        response = await api.registerUser(formData.email, formData.password, formData.name);
      }

      // Check if the API call was successful and returned user data
      if (response.is_success && response.user) {
        setIsSuccess(true); // Show success feedback
        
        // Dispatch the user data to Redux - this updates the state
        dispatch(loginSuccess(response.user)); 
        
        // No reload needed! The useEffect watching isAuthenticated will navigate.
        // Let the success animation play briefly if desired
        setTimeout(() => {
           // Navigation will happen automatically due to state change triggering the useEffect
           // If navigation doesn't happen automatically, uncomment below:
           // navigate('/dashboard', { replace: true }); 
        }, 1000); // Short delay for visual feedback
        
      } else {
        // Handle cases where API reports success=false or user data is missing
        setError(response.message || 'Login/Registrasi gagal.');
        setIsLoading(false); 
      }

    } catch (err: any) {
      // ... existing error handling ...
      setError(err.message || 'Terjadi kesalahan, silakan coba lagi');
      setIsLoading(false); // Ensure loading state is reset on error
    } 
    // Removed finally block that set isLoading to false, handle it within try/catch/success
  };
  
  // Validate login form based on Laravel requirements
  const validateLoginForm = () => {
    // Email validation
    if (!formData.email) {
      return 'Email tidak boleh kosong';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Email tidak valid';
    }
    
    // Password validation
    if (!formData.password) {
      return 'Password tidak boleh kosong';
    }
    
    return null;
  };
  
  // Validate registration form based on Laravel requirements
  const validateRegisterForm = () => {
    // Name validation
    if (!formData.name) {
      return 'Nama tidak boleh kosong';
    }
    
    if (formData.name.length > 255) {
      return 'Nama tidak boleh lebih dari 255 karakter';
    }
    
    // Email validation
    if (!formData.email) {
      return 'Email tidak boleh kosong';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Email tidak valid';
    }
    
    if (formData.email.length > 255) {
      return 'Email tidak boleh lebih dari 255 karakter';
    }
    
    // Password validation
    if (!formData.password) {
      return 'Password tidak boleh kosong';
    }
    
    if (formData.password.length < 8) {
      return 'Password minimal 8 karakter';
    }
    
    // Laravel Password::defaults() typically requires a mix of uppercase, lowercase, numbers, and special characters
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(formData.password);
    
    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChars) {
      return 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus';
    }
    
    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      return 'Konfirmasi password tidak cocok';
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ name, value }));
    if (error) setError(null); // Clear error on input change
  };

  const switchMode = () => {
    dispatch(setIsLogin(!isLogin));
    setError(null);
    setIsSuccess(false); // Reset success state
    setIsLoading(false); // Reset loading state
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ButtonSpinner size={32} color="#0600ad" />
          <div className="w-60 text-center">
            <SkeletonLoader type="text" className="mb-1" />
            <SkeletonLoader type="text" width={120} className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WavyGradientBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="neu-card bg-white bg-opacity-95 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="flex">
            <motion.button
              className={`w-1/2 py-4 text-center font-medium text-lg ${isLogin ? 'bg-[#0600ad] text-white' : 'neu-flat-light text-gray-600'}`}
              onClick={() => dispatch(setIsLogin(true))}
              whileTap={{ scale: 0.97 }}
            >
              Masuk
            </motion.button>
            <motion.button
              className={`w-1/2 py-4 text-center font-medium text-lg ${!isLogin ? 'bg-[#0600ad] text-white' : 'neu-flat-light text-gray-600'}`}
              onClick={() => dispatch(setIsLogin(false))}
              whileTap={{ scale: 0.97 }}
            >
              Daftar
            </motion.button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                  {isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun'}
                </h2>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-100 text-red-700 p-4 neu-flat-light rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isLogin && (
                  <div className="neu-flat-light p-4 rounded-xl">
                    <FormInput
                      id="name"
                      name="name"
                      type="text"
                      label="Nama Lengkap"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </div>
                )}

                <div className="neu-flat-light p-4 rounded-xl">
                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email Anda"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="neu-flat-light p-4 rounded-xl">
                  <FormInput
                    id="password"
                    name="password"
                    type="password"
                    label="Kata Sandi"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan kata sandi Anda"
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  
                  {(formData.password.length > 0 || !isLogin) && (
                    <PasswordStrength password={formData.password} />
                  )}
                </div>

                {!isLogin && (
                  <div className="neu-flat-light p-4 rounded-xl">
                    <FormInput
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      label="Konfirmasi Kata Sandi"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Konfirmasi kata sandi Anda"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 text-[#0600ad] rounded border-gray-300 focus:ring-[#0600ad]"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-gray-700">Ingat saya</label>
                    </div>
                    <a href="#" className="text-sm font-medium text-[#0600ad] hover:text-[#0500c4]">
                      Lupa kata sandi?
                    </a>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading || isSuccess} // Disable while loading or showing success
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(6, 0, 173, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-lg neu-button-primary bg-gradient-to-r from-[#0600ad] to-[#0500c4] text-white font-medium text-lg transition-all relative overflow-hidden
                    ${(isLoading || isSuccess) ? 'opacity-80 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? ( // Check isLoading state
                    <span className="flex items-center justify-center">
                      <ButtonSpinner size={20} color="white" className="mr-2" />
                      Memproses...
                    </span>
                  ) : (
                    isLogin ? 'Masuk' : 'Buat Akun'
                  )}
                  
                  {/* Success Animation */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div 
                        className="absolute inset-0 bg-green-500 flex items-center justify-center"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Berhasil!
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                    <motion.button
                      type="button"
                      onClick={switchMode}
                      className="font-medium text-[#0600ad] hover:text-[#0500c4]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isLogin ? 'Daftar' : 'Masuk'}
                    </motion.button>
                  </p>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
