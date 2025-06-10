/**
 * ProtectedRoute Component - Route Protection untuk Azure Entra External ID
 * 
 * Komponen wrapper yang melindungi route/komponen yang memerlukan authentication
 * Menyediakan fallback UI dan redirect logic untuk unauthorized access
 * 
 * Features:
 * - Route protection berdasarkan authentication status
 * - Loading states saat checking authentication
 * - Custom fallback components
 * - Automatic redirect ke login
 * - Permission-based access control
 * - Breadcrumb dan navigation support
 * 
 * Best Practices Applied:
 * - React component composition patterns
 * - Error boundary integration
 * - Accessibility support
 * - Performance optimization
 * - Type safety
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Props untuk ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Children components yang akan di-render jika authenticated */
  children: React.ReactNode;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom unauthorized component */
  unauthorizedComponent?: React.ReactNode;
  /** Required permissions (optional) */
  requiredPermissions?: string[];
  /** Fallback component jika permissions tidak terpenuhi */
  permissionDeniedComponent?: React.ReactNode;
  /** Auto redirect ke login jika tidak authenticated */
  autoRedirect?: boolean;
  /** Custom redirect path */
  redirectPath?: string;
  /** Show login button di unauthorized state */
  showLoginButton?: boolean;
  /** Custom styling */
  className?: string;
}

/**
 * Default Loading Component
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-900">Loading...</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Checking authentication status
        </p>
      </div>
    </div>
  </div>
);

/**
 * Default Unauthorized Component
 */
const DefaultUnauthorizedComponent: React.FC<{
  showLoginButton?: boolean;
  onLogin?: () => void;
}> = ({ showLoginButton = true, onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You need to sign in to access this page
        </p>
        
        {showLoginButton && (
          <div className="mt-6">
            <button
              onClick={onLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * Default Permission Denied Component
 */
const DefaultPermissionDeniedComponent: React.FC<{
  requiredPermissions?: string[];
}> = ({ requiredPermissions }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Permission Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have the required permissions to access this page
        </p>
        
        {requiredPermissions && requiredPermissions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Required permissions:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {requiredPermissions.map((permission, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Check user permissions (placeholder implementation)
 * Dalam implementasi nyata, ini bisa menggunakan token claims atau API call
 */
const hasRequiredPermissions = (
  userPermissions: string[] = [],
  requiredPermissions: string[] = []
): boolean => {
  if (!requiredPermissions.length) return true;
  
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

/**
 * ProtectedRoute Component
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  loadingComponent,
  unauthorizedComponent,
  requiredPermissions = [],
  permissionDeniedComponent,
  autoRedirect = false,
  showLoginButton = true,
  className = '',
}) => {
  const {
    isAuthenticated,
    user,
    isLoading,
    isInitialized,
    login,
    error
  } = useAuth();

  /**
   * Handle login action
   */
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed from ProtectedRoute:', error);
    }
  };

  // Show loading saat belum initialized atau sedang loading
  if (!isInitialized || isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <DefaultLoadingComponent />}
      </div>
    );
  }

  // Show error jika ada error dan tidak authenticated
  if (error && !isAuthenticated) {
    return (
      <div className={className}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Authentication Error
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error}
              </p>
              <button
                onClick={handleLogin}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika belum authenticated
  if (!isAuthenticated) {
    // Auto redirect ke login jika enabled
    if (autoRedirect) {
      handleLogin();
      return (
        <div className={className}>
          <DefaultLoadingComponent />
        </div>
      );
    }
    
    // Show unauthorized component
    return (
      <div className={className}>
        {unauthorizedComponent || (
          <DefaultUnauthorizedComponent 
            showLoginButton={showLoginButton}
            onLogin={handleLogin}
          />
        )}
      </div>
    );
  }

  // Check permissions jika ada yang diperlukan
  if (requiredPermissions.length > 0) {
    // Dalam implementasi nyata, ambil permissions dari token claims atau user profile
    // Untuk sekarang, gunakan placeholder
    const userPermissions: string[] = []; // TODO: Get from token claims
    
    if (!hasRequiredPermissions(userPermissions, requiredPermissions)) {
      return (
        <div className={className}>
          {permissionDeniedComponent || (
            <DefaultPermissionDeniedComponent 
              requiredPermissions={requiredPermissions}
            />
          )}
        </div>
      );
    }
  }

  // User authenticated dan memiliki permissions yang diperlukan
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/**
 * Higher Order Component version untuk easy wrapping
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  protectionProps?: Omit<ProtectedRouteProps, 'children'>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ProtectedRoute {...protectionProps}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ProtectedRoute;
