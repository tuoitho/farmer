'use server';
import { APP_CONFIG } from '@/common/config';
import { cookies } from 'next/headers';
export async function getTokenUser() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get(APP_CONFIG.cookies.tokenKey);
    return token?.value;
  } catch (error) {
    return undefined;
  }
}
