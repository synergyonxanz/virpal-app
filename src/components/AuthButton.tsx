/**
 * AuthButton Component - Login/Logout Button untuk Azure Entra External ID
 * 
 * Komponen button yang menangani login dan logout dengan UI yang responsif
 * dan feedback yang jelas untuk user
 * 
 * Features:
 * - Login popup/redirect options
 * - Loading states dengan spinner
 * - Error handling dan display
 * - User profile display
 * - Responsive design
 * - Accessibility support
 * 
 * Best Practices Applied:
 * - React component patterns
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Loading states dan UX feedback
 * - Error boundary integration
 * - CSS-in-JS dengan Tailwind
 */

import React, { useState, useEffect, useRef } from 'react';

/**
 * Props untuk AuthButton component
 */
interface AuthButtonProps {
  /** Authentication state - passed from parent */
  isAuthenticated: boolean;
  user: any;
  error: string | null;
  isInitialized: boolean;
  /** Authentication methods - passed from parent */
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  onClearError: () => void;
  /** Tipe login: popup atau redirect */
  loginType?: 'popup' | 'redirect';
  /** Custom styling */
  className?: string;
  /** Show user profile saat authenticated */
  showProfile?: boolean;
  /** Custom text untuk login button */
  loginText?: string;
  /** Custom text untuk logout button */
  logoutText?: string;
  /** Loading indicator component */
  loadingComponent?: React.ReactNode;
  /** Error display component */
  errorComponent?: (error: string) => React.ReactNode;
  /** Callback saat login berhasil */
  onLoginSuccess?: () => void;
  /** Callback saat logout berhasil */
  onLogoutSuccess?: () => void;
  /** Callback untuk show user details modal */
  onShowUserDetails?: () => void;
  /** Callback saat error */
  onError?: (error: string) => void;
}

/**
 * Loading Spinner Component
 */
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Error Display Component - VIRPAL Style
 */
const ErrorDisplay: React.FC<{ error: string; onDismiss?: () => void }> = ({ error, onDismiss }) => (
  <div 
    className="rounded-md p-3 mb-4 border theme-transition"
    style={{
      backgroundColor: 'var(--virpal-accent)',
      borderColor: 'var(--virpal-primary)',
      color: 'var(--virpal-primary)'
    }}
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--virpal-primary)' }}>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm" style={{ color: 'var(--virpal-primary)' }}>{error}</p>
      </div>
      {onDismiss && (
        <div className="ml-auto pl-3">
          <button
            onClick={onDismiss}
            className="inline-flex focus:outline-none focus:ring-2 transition-colors theme-transition"
            style={{ 
              color: 'var(--virpal-primary)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--virpal-primary-hover)';
              e.currentTarget.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--virpal-primary)';
            }}
            aria-label="Dismiss error"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  </div>
);

/**
 * AuthButton Component
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  // Authentication state from parent
  isAuthenticated,
  user,
  error,
  isInitialized,
  // Authentication methods from parent
  onLogin,
  onLogout,
  onClearError,
  // Component props
  loginType = 'popup',
  className = '',
  showProfile = true,
  loginText = 'Login',
  logoutText = 'Sign Out',
  loadingComponent,
  errorComponent,
  onLoginSuccess,
  onLogoutSuccess,
  onShowUserDetails,
  onError,
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Component setup complete

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    
    return undefined;
  }, [showDropdown]);
  // Fix the loading logic: show loading only when:
  // 1. User clicked button (localLoading), OR
  // 2. Auth system is not yet initialized (!isInitialized)
  const isCurrentlyLoading = localLoading || !isInitialized;
  /**
   * Handle login action
   */
  const handleLogin = async () => {
    try {
      setLocalLoading(true);
      onClearError();      await onLogin();
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Login failed');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    try {
      setLocalLoading(true);
      onClearError();
      
      await onLogout();
        if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Logout failed');
      }
    } finally {
      setLocalLoading(false);
    }
  };  // Show loading saat initialization - with timeout
  if (!isInitialized) {
    return (
      <div className={`flex flex-col ${className}`}>
        {/* Error display disabled - handled by parent toast system */}
      </div>
    );
  }
  // Error display function - disabled to prevent conflict with toast system
  const renderError = () => {
    // Errors now handled by parent component's toast system
    return null;
  };
      // Authenticated state - show user profile circle with dropdown - VIRPAL Style
  if (isAuthenticated && user) {
    return (
      <div className={`relative ${className}`}>
        {renderError()}
        {showProfile && (
          <div className="relative" ref={dropdownRef}>            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center w-10 h-10 rounded-full font-medium focus:outline-none focus:ring-2 transition-all duration-200 theme-transition"
              style={{
                backgroundColor: 'var(--virpal-primary)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 0 0 2px var(--virpal-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary-hover)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary-active)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary-hover)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--virpal-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label={`Account menu for ${user.displayName || user.email}`}
              title={user.displayName || user.email || 'User'}
            >
              {user.displayName 
                ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : user.email?.charAt(0).toUpperCase() || '?'}
            </button>
            
            {/* Dropdown Menu - VIRPAL Style */}
            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 border theme-transition"
                style={{
                  backgroundColor: 'var(--virpal-content-bg)',
                  borderColor: 'var(--virpal-neutral-lighter)'
                }}
              >
                <div className="px-4 py-2 border-b theme-transition" style={{ borderColor: 'var(--virpal-neutral-lighter)' }}>
                  <p className="text-sm font-medium theme-transition" style={{ color: 'var(--virpal-neutral-default)' }}>
                    {user.displayName || 'User'}
                  </p>
                  {user.email && (
                    <p className="text-xs theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>{user.email}</p>
                  )}
                </div>
                {onShowUserDetails && (
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onShowUserDetails();
                    }}
                    className="w-full text-left px-4 py-2 text-sm focus:outline-none transition-colors theme-transition"
                    style={{
                      color: 'var(--virpal-neutral-default)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
                      e.currentTarget.style.cursor = 'pointer';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    User Details
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  disabled={isCurrentlyLoading}
                  className={`
                    w-full text-left px-4 py-2 text-sm focus:outline-none transition-colors theme-transition
                    ${isCurrentlyLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{
                    color: 'var(--virpal-neutral-default)',
                    cursor: isCurrentlyLoading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentlyLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
                      e.currentTarget.style.cursor = 'pointer';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentlyLoading) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {isCurrentlyLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Signing out...</span>
                    </span>
                  ) : (
                    logoutText
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  // Not authenticated state - show login button
  return (
    <div className={`flex flex-col ${className}`}>
      {renderError()}
        <button
        onClick={handleLogin}
        disabled={isCurrentlyLoading}
        className={`
          inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium transition-all duration-200 theme-transition
          ${isCurrentlyLoading 
            ? 'cursor-not-allowed opacity-50' 
            : ''
          }
        `}
        style={{
          backgroundColor: isCurrentlyLoading ? 'var(--virpal-neutral-lighter)' : 'var(--virpal-secondary)',
          color: 'white',
          cursor: isCurrentlyLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
        onMouseEnter={(e) => {
          if (!isCurrentlyLoading) {
            e.currentTarget.style.backgroundColor = 'var(--virpal-secondary-hover)';
            e.currentTarget.style.cursor = 'pointer';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrentlyLoading) {
            e.currentTarget.style.backgroundColor = 'var(--virpal-secondary)';
          }
        }}
        onMouseDown={(e) => {
          if (!isCurrentlyLoading) {
            e.currentTarget.style.backgroundColor = 'var(--virpal-secondary-active)';
          }
        }}
        onMouseUp={(e) => {
          if (!isCurrentlyLoading) {
            e.currentTarget.style.backgroundColor = 'var(--virpal-secondary-hover)';
          }
        }}
        onFocus={(e) => {
          if (!isCurrentlyLoading) {
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--virpal-secondary), 0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
        }}
        aria-label={`${loginText} with ${loginType}`}
      >
        {isCurrentlyLoading ? (
          <>
            {loadingComponent || <LoadingSpinner />}
            <span className="ml-2">Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {loginText}
          </>
        )}      </button>
    </div>
  );
};

export default AuthButton;
