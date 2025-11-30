/**
 * Fetch wrapper với xử lý 401 Unauthorized tự động
 * Sử dụng cho tất cả HTTP methods (GET, POST, PUT, DELETE, PATCH)
 */

/**
 * Xử lý response 401 - Token expired
 */
function handle401Response(isServer: boolean): void {
  console.warn('⚠️ API: 401 Unauthorized - Token expired');
  
  // Nếu ở client-side, reload trang để middleware xử lý refresh
  if (!isServer) {
    console.log('🔄 Reloading page to trigger middleware refresh...');
    window.location.reload();
  } else {
    // Nếu ở server-side, throw error để component xử lý
    throw new Error('Token expired - 401 Unauthorized');
  }
}

/**
 * Fetch wrapper với auto-retry khi gặp 401
 * @param url - API endpoint
 * @param options - Fetch options
 * @returns Response hoặc undefined nếu 401 ở client-side
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit
): Promise<Response | undefined> {
  const isServer = typeof window === 'undefined';
  
  const response = await fetch(url, options);
  
  // Xử lý 401 Unauthorized
  if (response.status === 401) {
    handle401Response(isServer);
    return undefined; // Chỉ return undefined ở client (sau reload)
  }
  
  return response;
}

/**
 * Fetch wrapper trả về JSON với xử lý 401
 */
export async function fetchJsonWithAuth<T = unknown>(
  url: string,
  options: RequestInit
): Promise<T | undefined> {
  const response = await fetchWithAuth(url, options);
  
  if (!response) {
    return undefined; // 401 đã được xử lý
  }
  
  return await response.json();
}
