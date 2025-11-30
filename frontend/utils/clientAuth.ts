/**
 * Client-side authentication utilities
 * Uses cookies for all authentication data
 */
import { APP_CONFIG } from '@/common/config';
import { getCookie, deleteCookie } from 'cookies-next';
import authApi from '@/services/auth';

export const clientAuthUtils = {
  /**
   * Save authentication data to cookies
   * Note: This is handled by server actions after successful login/register
   */
  saveAuthData: (token: string, user: any) => {
    // Cookies are set by server actions, this method is kept for compatibility
    // but doesn't do anything on client-side
    console.log('Auth data is saved via server actions (cookies)');
  },

  /**
   * Get authentication token from cookies
   */
  getToken: (): string | undefined => {
    return getCookie(APP_CONFIG.cookies.tokenKey) as string | undefined;
  },

  /**
   * Get refresh token from cookies
   */
  getRefreshToken: (): string | undefined => {
    return getCookie(APP_CONFIG.cookies.refreshTokenKey) as string | undefined;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<boolean> => {
    try {
      const { actionRefreshToken } = await import('@/action/auth');
      const result = await actionRefreshToken();
      if (result.success) {
        console.log('Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },

  /**
   * Get user data from cookies
   * Note: User data is not stored in cookies, only token
   */
  getUser: (): any => {
    // User data is not stored in cookies, only token
    // This method returns undefined for now
    return undefined;
  },

  /**
   * Clear authentication data from cookies
   * Note: This is handled by server action logout
   */
  clearAuthData: () => {
    // Cookies are deleted by server action, this method is kept for compatibility
    deleteCookie(APP_CONFIG.cookies.tokenKey);
    deleteCookie(APP_CONFIG.cookies.refreshTokenKey);
  },

  /**
   * Check if user is authenticated (has token in cookies)
   */
  isAuthenticated: (): boolean => {
    return !!clientAuthUtils.getToken();
  }
};
