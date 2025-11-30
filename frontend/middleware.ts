import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cấu hình các route cần kiểm tra auth
const protectedRoutes = ['/dashboard'];

// Helper: Decode JWT và check expiry (không cần verify signature vì backend sẽ verify)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;

    if (!exp) return true; // Không có exp field -> coi như expired

    const now = Math.floor(Date.now() / 1000);
    return exp < now; // exp < now = expired
  } catch (error) {
    console.error('❌ JWT decode error:', error);
    return true; // Decode lỗi -> coi như expired
  }
}

// Helper: Refresh token và trả về response mới
async function refreshAccessToken(
  refreshToken: string
): Promise<NextResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiClient = process.env.NEXT_PUBLIC_API_CLIENT;

    console.log('🔄 Middleware: Refreshing token...');

    const res = await fetch(`${apiUrl}/${apiClient}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();

    if (data.success && data.data?.access_token) {
      console.log('✅ Middleware: Refresh success!');

      // Tạo response để tiếp tục request
      const response = NextResponse.next();

      // Cập nhật cookie mới
      const expiresIn = data.data.expires_in || 60 * 60 * 24 * 7;
      response.cookies.set('token', data.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expiresIn,
        path: '/',
      });

      if (data.data.refresh_token) {
        response.cookies.set('refresh_token', data.data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      }

      return response;
    }

    console.error('❌ Middleware: Refresh failed -', data.message);
    return null;
  } catch (error) {
    console.error('❌ Middleware: Refresh error:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Kiểm tra xem route hiện tại có cần bảo vệ không
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // Trường hợp 1: Có token -> Check expiry
    if (token) {
      const expired = isTokenExpired(token);

      if (!expired) {
        // Token còn hạn -> Cho qua
        return NextResponse.next();
      }

      // Token hết hạn -> Thử refresh
      console.log('⚠️ Middleware: Token expired, attempting refresh...');
      if (refreshToken) {
        const response = await refreshAccessToken(refreshToken);
        if (response) {
          return response; // Refresh thành công
        }
      }

      // Không có refresh token hoặc refresh thất bại -> Redirect login
      const loginUrl = new URL('/signin', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Trường hợp 2: Không có token nhưng có refresh_token -> Thử refresh
    if (refreshToken) {
      const response = await refreshAccessToken(refreshToken);
      if (response) {
        return response; // Refresh thành công
      }
    }

    // Trường hợp 3: Không có gì cả hoặc refresh thất bại -> Về trang login
    const loginUrl = new URL('/signin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect logged-in users from landing page to dashboard
  if (pathname === '/') {
    const token = request.cookies.get('token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (refreshToken) {
      const response = await refreshAccessToken(refreshToken);
      if (response) {
        // If refresh successful, redirect to dashboard with new cookies
        const dashboardUrl = new URL('/dashboard', request.url);
        const redirectResponse = NextResponse.redirect(dashboardUrl);

        // Copy cookies from refresh response to redirect response
        response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie,
            sameSite: cookie.sameSite as "lax" | "strict" | "none" | undefined
          });
        });

        return redirectResponse;
      }
    }
  }

  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các route cần thiết
export const config = {
  matcher: [
    '/dashboard/:path*', // Áp dụng cho tất cả route con của dashboard
    '/', // Check landing page for redirect
  ],
};
