// filepath: d:\Applicant\my-app\src\routes\index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { PrivateRoute } from '../components';
import SkeletonLoader from '../components/Skeleton/SkeletonLoader';

// Lazy load components for code splitting
const AuthPage = lazy(() => import('../pages/AuthPage'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Weather = lazy(() => import('../pages/Weather'));
const Profile = lazy(() => import('../pages/Profile'));
const Users = lazy(() => import('../pages/Users'));
const Admin = lazy(() => import('../pages/Admin'));

// Loading component used for Suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-full max-w-md mx-auto p-6">
      <SkeletonLoader type="title" className="mb-4" />
      <SkeletonLoader type="text" count={3} className="mb-2" />
      <SkeletonLoader type="rect" height={200} className="mb-4" />
      <SkeletonLoader type="text" count={2} className="mb-2" />
    </div>
  </div>
);

const AuthenticatedRoutes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: "login",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AuthPage />
            </Suspense>
          )
        },
        {
          path: "dashboard",
          element: (
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </PrivateRoute>
          ),
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Weather />
                </Suspense>
              )
            },
            {
              path: "weather",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Weather />
                </Suspense>
              )
            },
            {
              path: "profile",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              )
            },
            {
              path: "users",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Users />
                </Suspense>
              )
            },
            {
              path: "admin",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
              )
            }
          ]
        },
        {
          path: "*",
          element: <Navigate to="/dashboard" replace />
        }
      ]
    }
  ]);

  return router;
};

export default AuthenticatedRoutes;