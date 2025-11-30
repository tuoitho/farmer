import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/common/config';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware đã xử lý việc refresh token
  // Chỉ cần kiểm tra token có tồn tại không
  const token = (await cookies()).get(APP_CONFIG.cookies.tokenKey);

  if (!token) {
    redirect('/signin');
  }

  return <>{children}</>;
}
