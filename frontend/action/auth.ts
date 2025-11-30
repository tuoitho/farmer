'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { authApi } from '@/services';
import { TLoginPayload, TLoginResponse, TRegisterPayload } from '@/models/auth';
import { UserProfileUpdate, ChangePasswordRequest } from '@/models/user';
import { APP_CONFIG } from '@/common/config';


// Simple auth functions for a one-week project

// Login function
export async function actionLogin(phone: string, password: string) {
  try {
    // In a real app, you would call your auth API here
    const res = await authApi.login({ phone, password });

    if (!res.success) {
      return { success: false, error: res.message };
    }

    // Set auth cookie
    (await cookies()).set(APP_CONFIG.cookies.tokenKey, res.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: res.data.expires_in || 60 * 60 * 24 * 7, // Use expires_in from API or fallback to 1 week
      path: '/',
    });

    // Set refresh token cookie if available
    if (res.data.refresh_token) {
      (await cookies()).set(APP_CONFIG.cookies.refreshTokenKey, res.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // Refresh token typically lasts longer (30 days)
        path: '/',
      });
    }

    // Revalidate user data
    revalidatePath('/dashboard');

    return { success: true, user: res.data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

// Register function
export async function actionRegister(full_name: string, phone: string, password: string, confirm_password: string, province: string) {
  try {
    // Validate passwords match
    if (password !== confirm_password) {
      return { success: false, error: 'Mật khẩu không khớp' };
    }

    // Call register API
    const res = await authApi.register({ full_name, phone, password, confirm_password, province });
  

    if (!res || !res.success) {
      return { success: false, error: res?.message || 'Đăng ký thất bại' };
    }

    // If register API doesn't return token, login automatically
    let token = res?.data?.access_token;
    let expires_in = res?.data?.expires_in;
    let loginRes = null;
    
    if (!token) {
      console.log('No token from register, attempting auto-login...');
      loginRes = await authApi.login({ phone, password });
      console.log('Auto-login response:', loginRes);
      
      if (loginRes.success && loginRes.data?.access_token) {
        token = loginRes.data.access_token;
        expires_in = loginRes.data.expires_in;
      }
    }

    if (!token) {
      return { success: false, error: 'Đăng ký thành công nhưng không thể lấy token' };
    }

    // Set auth cookie after successful registration
    (await cookies()).set(APP_CONFIG.cookies.tokenKey, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in || 60 * 60 * 24 * 7, // Use expires_in from API or fallback to 1 week
      path: '/',
    });

    // Set refresh token cookie if available from register or login response
    const refreshToken = res?.data?.refresh_token || loginRes?.data?.refresh_token;
    if (refreshToken) {
      (await cookies()).set(APP_CONFIG.cookies.refreshTokenKey, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // Refresh token typically lasts longer (30 days)
        path: '/',
      });
    }

    // Revalidate user data
    revalidatePath('/dashboard');

    return { success: true, user: res.data };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Đăng ký thất bại' };
  }
}

// Refresh token function
export async function actionRefreshToken() {
  try {
    // Get refresh token from cookies
    // QUAN TRỌNG: Thêm .value để lấy chuỗi token
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get(APP_CONFIG.cookies.refreshTokenKey);
    const refreshToken = refreshTokenCookie?.value;

    console.log('=== REFRESH TOKEN DEBUG ===');
    console.log('Refresh token from cookies:', refreshToken ? 'EXISTS' : 'NOT FOUND');

    if (!refreshToken) {
      console.log('❌ No refresh token found in cookies');
      return { success: false, error: 'No refresh token found' };
    }

    // Call refresh API with refresh token in body
    console.log('🔄 Calling refresh API...');
    
    // CẬP NHẬT: Truyền refreshToken vào hàm service
    const res = await authApi.refreshToken(refreshToken);
    
    console.log('Refresh API response:', res);
    
    if (!res || !res.success) {
       // Nếu refresh thất bại, nên xóa cookie để tránh lặp vô tận
       (await cookies()).delete(APP_CONFIG.cookies.tokenKey);
       (await cookies()).delete(APP_CONFIG.cookies.refreshTokenKey);
       
       return { success: false, error: res?.message || 'Token refresh failed' };
    }

    // ... Phần logic set cookie bên dưới giữ nguyên ...
    (await cookies()).set(APP_CONFIG.cookies.tokenKey, res.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: res.data.expires_in || 60 * 60 * 24 * 7,
        path: '/',
      });
  
      // Update refresh token if returned
      if (res.data.refresh_token) {
        (await cookies()).set(APP_CONFIG.cookies.refreshTokenKey, res.data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      }
    
    return { success: true, data: res.data };
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return { success: false, error: 'Token refresh failed' };
  }
}

// Logout function
export async function actionLogout() {
  try {
    // Remove auth cookie
    (await cookies()).delete(APP_CONFIG.cookies.tokenKey);
    
    // Remove refresh token cookie
    (await cookies()).delete(APP_CONFIG.cookies.refreshTokenKey);
    
    // Revalidate user data
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}

// Check auth status
export async function checkAuth() {
  const token = (await cookies()).get( APP_CONFIG.cookies.tokenKey);
  return { isAuthenticated: !!token };
}
/**
 * Remove token only (for specific cases)
 */
export async function actionRemoveToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_CONFIG.cookies.tokenKey);

  if (token) {
    cookieStore.delete(APP_CONFIG.cookies.tokenKey);
  }
}

/**
 * Check if user is authenticated
 */
export async function checkAuthAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(APP_CONFIG.cookies.tokenKey);

    return {
      isAuthenticated: !!token?.value,
      token: token?.value,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      token: undefined,
    };
  }
}

// Get user profile
export async function actionGetProfile() {
  try {
    // Get token from cookies (server-side)
    const cookieStore = await cookies();
    const token = cookieStore.get(APP_CONFIG.cookies.tokenKey)?.value;

    if (!token) {
      return { success: false, error: 'Không tìm thấy token xác thực' };
    }

    // Call API directly with token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const res = await response.json();

    if (!res || !res.success) {
      return { success: false, error: res?.message || 'Không thể lấy thông tin hồ sơ' };
    }

    return { success: true, data: res.data };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Không thể lấy thông tin hồ sơ' };
  }
}

// Update user profile
export async function actionUpdateProfile(profileData: UserProfileUpdate) {
  try {
    // Get token from cookies (server-side)
    const cookieStore = await cookies();
    const token = cookieStore.get(APP_CONFIG.cookies.tokenKey)?.value;

    if (!token) {
      return { success: false, error: 'Không tìm thấy token xác thực' };
    }

    // Call API directly with token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const res = await response.json();

    if (!res || !res.success) {
      return { success: false, error: res?.message || 'Cập nhật hồ sơ thất bại' };
    }

    // Revalidate user data
    revalidatePath('/dashboard/profile');

    return { success: true, data: res.data, message: res.message || 'Cập nhật hồ sơ thành công' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Cập nhật hồ sơ thất bại' };
  }
}

// Change password
export async function actionChangePassword(passwordData: ChangePasswordRequest) {
  try {
    // Get token from cookies (server-side)
    const cookieStore = await cookies();
    const token = cookieStore.get(APP_CONFIG.cookies.tokenKey)?.value;

    if (!token) {
      return { success: false, error: 'Không tìm thấy token xác thực' };
    }

    // Call API directly with token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    const res = await response.json();

    if (!res || !res.success) {
      return { success: false, error: res?.message || 'Đổi mật khẩu thất bại' };
    }

    return { success: true, message: res.message || 'Đổi mật khẩu thành công' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Đổi mật khẩu thất bại' };
  }
}

