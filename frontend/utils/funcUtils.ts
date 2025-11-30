import { APP_CONFIG } from '@/common/config';
import { getCookie } from 'cookies-next';
import { toast } from 'sonner';
import { clientAuthUtils } from './clientAuth';

export type TParams = Record<string, string | number | boolean | undefined | null>;

export const funcUtils = {
  /**
   * Combines base URL with query parameters
   * @param url - Base URL
   * @param params - Query parameters as key-value pairs
   * @returns Formatted URL with query string
   */
  combineURL: (url: string, params?: TParams): string => {
    if (!params || Object.keys(params).length === 0) return url;
    
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  },

  /**
   * Formats number with thousands separators
   * @param num - Number to format
   * @returns Formatted number as string
   */
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  },

  /**
   * Formats price with currency
   * @param price - Price to format
   * @param currency - Currency symbol (default: '₫')
   * @returns Formatted price string
   */
  formatPrice: (price: number, currency: string = '₫'): string => {
    return `${new Intl.NumberFormat('vi-VN').format(price)}${currency}`;
  },

  /**
   * Handles API errors and shows toast notifications
   * @param error - Error object or message
   * @param defaultMessage - Default error message
   */
  handleApiError: (error: unknown, defaultMessage: string = 'Có lỗi xảy ra'): void => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('API Error:', message);
    toast.error(message || defaultMessage);
  },

  /**
   * Gets authentication token from cookie or localStorage
   * @returns Authentication token or undefined if not found
   */
  getAuthToken: (): string | undefined => {
    return getCookie(APP_CONFIG.cookies.tokenKey) as string | undefined;
  },

  getRefreshToken: (): string | undefined => {
    return getCookie(APP_CONFIG.cookies.refreshTokenKey) as string | undefined;
  },

  /**
   * Checks if a value is empty
   * @param value - Value to check
   * @returns Boolean indicating if the value is empty
   */
  isEmpty: (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * Debounce function to limit the rate at which a function is called
   * @param func - Function to debounce
   * @param wait - Wait time in milliseconds
   * @returns Debounced function
   */
  debounce: <F extends (...args: any[]) => any>(
    func: F,
    wait: number
  ): ((...args: Parameters<F>) => void) => {
    let timeout: NodeJS.Timeout;
    return function(this: any, ...args: Parameters<F>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * Throttle function to limit the rate at which a function is called
   * @param func - Function to throttle
   * @param limit - Time limit in milliseconds
   * @returns Throttled function
   */
  throttle: <F extends (...args: any[]) => any>(
    func: F,
    limit: number
  ): ((...args: Parameters<F>) => void) => {
    let inThrottle = false;
    return function(this: any, ...args: Parameters<F>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Creates fetch headers object with cache options and authorization
   * @param token - Authorization token
   * @param isCache - Whether to use caching
   * @param tag - Cache tag for revalidation
   * @returns Fetch headers object
   */
  FetchHeaders: (token?: string, isCache: boolean = true, tag?: string) => {
    return {
      cache: isCache ? 'force-cache' : 'no-store' as RequestCache,
      next: {
        revalidate: isCache ? 3600 : 0,
        tags: tag ? [tag] : []
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
      }
    };
  }
};

export default funcUtils;
