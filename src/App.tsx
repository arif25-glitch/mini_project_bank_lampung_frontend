import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setWeatherActive } from './redux/features/uiSlice';
import { fetchUserData } from './redux/features/authSlice';

const CloudPattern = ({ isDay = true, weatherCondition = null }: { isDay?: boolean, weatherCondition?: string | null }) => {
  const getCloudStyles = () => {
    let opacity = 0.05;
    let animationDuration = '180s';
    let filter = 'grayscale(50%)';

    if (weatherCondition) {
      switch (weatherCondition) {
        case 'Cerah':
          opacity = 0.08;
          animationDuration = '200s';
          filter = 'grayscale(0%) brightness(1.1)';
          break;
        case 'Berawan Sebagian':
          opacity = 0.15;
          animationDuration = '150s';
          filter = 'grayscale(20%) brightness(1.05)';
          break;
        case 'Berawan':
          opacity = 0.25;
          animationDuration = '120s';
          filter = 'grayscale(40%) brightness(1)';
          break;
        case 'Hujan Ringan':
          opacity = 0.18;
          animationDuration = '100s';
          filter = 'grayscale(60%) brightness(0.9)';
          break;
        case 'Hujan Deras':
          opacity = 0.22;
          animationDuration = '80s';
          filter = 'grayscale(70%) brightness(0.8)';
          break;
        default:
          opacity = 0.1;
          animationDuration = '160s';
          filter = 'grayscale(30%)';
      }
    }

    const animation = `move-clouds ${animationDuration} linear infinite`;

    return { opacity, animation, filter };
  };

  const { opacity, animation, filter } = getCloudStyles();

  const cloudPaths = [
    "M100,150 C100,130 120,110 150,110 C160,110 170,115 175,125 C185,100 215,90 240,100 C265,110 270,140 270,150 C270,185 240,200 210,200 C180,200 150,185 150,150",
    "M400,200 C400,180 420,160 450,160 C460,160 470,165 475,175 C485,150 515,140 540,150 C565,160 570,190 570,200 C570,235 540,250 510,250 C480,250 450,235 450,200",
    "M150,350 C150,330 180,300 220,300 C240,300 260,310 270,330 C290,290 340,270 380,290 C420,310 430,350 430,370 C430,420 380,450 330,450 C280,450 230,420 230,370",
    "M650,400 C650,390 660,380 675,380 C680,380 685,382 688,387 C693,375 707,370 720,375 C733,380 735,395 735,400 C735,417 720,425 705,425 C690,425 675,417 675,400",
    "M750,100 C750,80 770,60 800,60 C810,60 820,65 825,75 C835,50 865,40 890,50 C915,60 920,90 920,100 C920,135 890,150 860,150 C830,150 800,135 800,100",
    "M50,450 C50,430 70,410 100,410 C110,410 120,415 125,425 C135,400 165,390 190,400 C215,410 220,440 220,450 C220,485 190,500 160,500 C130,500 100,485 100,450"
  ];

  const stars = isDay ? [] : [
    { cx: 350, cy: 80, r: 1.5 }, { cx: 480, cy: 60, r: 1 }, { cx: 400, cy: 40, r: 2 },
    { cx: 600, cy: 100, r: 1.5 }, { cx: 700, cy: 50, r: 2 }, { cx: 750, cy: 150, r: 1 },
    { cx: 180, cy: 70, r: 2 }, { cx: 230, cy: 40, r: 1.5 }, { cx: 120, cy: 30, r: 1 },
    { cx: 530, cy: 60, r: 1 }, { cx: 850, cy: 90, r: 1.5 }, { cx: 900, cy: 180, r: 2 },
    { cx: 50, cy: 50, r: 1.5 }, { cx: 950, cy: 50, r: 1 }
  ];

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]"
      style={{ opacity: opacity, animation: animation, filter: filter }}
    >
      <svg
        className="absolute top-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6" />
          </linearGradient>
          {weatherCondition?.includes('Hujan') && (
            <linearGradient id="rainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
            </linearGradient>
          )}
        </defs>

        {cloudPaths.map((path, index) => (
          <path key={`cloud-${index}`} d={path} fill="url(#cloudGradient)" />
        ))}

        {isDay ? (
          <g opacity={weatherCondition === 'Cerah' ? 1 : 0.6}>
            <circle cx="850" cy="100" r="60" fill="#FFD700" opacity="0.8" />
            <circle cx="850" cy="100" r="75" fill="none" stroke="#FFD700" strokeWidth="8" opacity="0.3" />
            <circle cx="850" cy="100" r="90" fill="none" stroke="#FFD700" strokeWidth="6" opacity="0.2" />
          </g>
        ) : (
          <g>
            <circle cx="850" cy="100" r="50" fill="#E1E1E1" opacity={weatherCondition?.includes('Hujan') ? 0.4 : 0.7} />
            <circle cx="880" cy="80" r="48" fill={getBackgroundClass().includes('slate') || getBackgroundClass().includes('gray') ? '#334155' : '#0f172a'} opacity="0.9" />
            {stars.map((star, index) => (
              <circle key={`star-${index}`} cx={star.cx} cy={star.cy} r={star.r} fill="white" opacity={0.8} />
            ))}
          </g>
        )}

        {weatherCondition?.includes('Hujan') && (
          <g opacity="0.5">
            {[...Array(15)].map((_, i) => (
              <line
                key={`rain-svg-${i}`}
                x1={50 + i * 60} y1={i % 2 === 0 ? 100 : 200}
                x2={40 + i * 60} y2={i % 2 === 0 ? 140 : 240}
                stroke="url(#rainGradient)" strokeWidth="1.5" strokeLinecap="round"
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

const RainEffect = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[-1] opacity-30"
    style={{
      background: `
        linear-gradient(to bottom, 
          rgba(255, 255, 255, 0) 0%, 
          rgba(255, 255, 255, 0.1) 100%
        )
      `,
      backgroundSize: '20px 20px',
      animation: 'rain 0.5s linear infinite'
    }}
  />
);

const getBackgroundClass = (isActive = false, condition: string | null = null) => {
    if (!isActive) return 'bg-gray-50';

    const weatherBgMap: Record<string, string> = {
      'Cerah': 'bg-gradient-to-br from-blue-400 to-sky-100',
      'Berawan': 'bg-gradient-to-br from-slate-400 to-slate-100',
      'Berawan Sebagian': 'bg-gradient-to-br from-blue-400 to-gray-200',
      'Hujan Ringan': 'bg-gradient-to-br from-blue-600 to-slate-300',
      'Hujan Deras': 'bg-gradient-to-br from-blue-800 to-slate-500'
    };

    return condition && weatherBgMap[condition]
      ? weatherBgMap[condition]
      : 'bg-gradient-to-br from-blue-400 to-blue-100';
};

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();  // Add this line to import the navigate function
  const { isActive, condition } = useAppSelector(state => state.ui.weather);
  const { isAuthenticated, userData, loading } = useAppSelector(state => state.auth);
  
  // Redirect authenticated users to dashboard if they're on the login/register page
  useEffect(() => {
    if (isAuthenticated && !loading && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // Debug useEffect to log auth state
  useEffect(() => {
    const authState = {
      isAuthenticated,
      userData,
      loading,
      hasToken: !!localStorage.getItem('auth_token')
    };
    console.log('Current Redux Auth State:', authState);
  }, [isAuthenticated, userData, loading]);

  // Enhanced user data fetching logic
  useEffect(() => {
    // Check for auth token to determine if we should fetch user data
    const token = localStorage.getItem('auth_token');
    
    if (token && isAuthenticated && !userData && !loading) {
      // This will trigger the fetchUserData thunk to get data from VITE_API_BASE_URL/api/user
      dispatch(fetchUserData());
      console.log('Fetching user data from API');
    }
  }, [isAuthenticated, userData, loading, dispatch]);

  // Weather route detection
  useEffect(() => {
    const isWeatherRoute = location.pathname === '/dashboard' ||
                           location.pathname.startsWith('/dashboard/weather');
    dispatch(setWeatherActive(isWeatherRoute));
  }, [location.pathname, dispatch, condition]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] transition-colors duration-1000">
      <Outlet />
    </div>
  );
}



export default App;