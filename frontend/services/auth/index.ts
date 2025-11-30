import {
  TLoginPayload,
  TLoginResponse,
  TRegisterPayload,
} from '@/models/auth';
import { User, UserProfileUpdate, ChangePasswordRequest } from '@/models/user';
import useApiPost from "@/services/useApiPost";
import useApiGet from "@/services/useApiGet";
import useApiPut from "@/services/useApiPut";
import { API_ROUTE, APP_CONFIG } from "@/common/config";
import funcUtils from "@/utils/funcUtils";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}

export default {
  login: (payload: TLoginPayload): Promise<TLoginResponse> => {
    return useApiPost<TLoginPayload>(`${API_ROUTE.auth.login}`, payload) as Promise<TLoginResponse>;
  },
  register: (payload: TRegisterPayload): Promise<TLoginResponse> => {
    return useApiPost<TRegisterPayload>(`${API_ROUTE.auth.register}`, payload) as Promise<TLoginResponse>;
  },
  logout: (): Promise<{ success: boolean }> => {
    return useApiPost<{}>(`${API_ROUTE.auth.logout}`, {}) as Promise<{ success: boolean }>;
  },
  refreshToken: (token?: string): Promise<TLoginResponse> => {
    // Ưu tiên sử dụng token truyền vào (từ Server Action),
    // nếu không có thì mới lấy từ funcUtils (trường hợp gọi từ Client)
    const tokenToUse = token || funcUtils.getRefreshToken() || '';
    
    return useApiPost<{ refresh_token: string }>(`${API_ROUTE.auth.refreshToken}`, {
      refresh_token: tokenToUse
    }) as Promise<TLoginResponse>;
  },
  getProfile: (): Promise<ApiResponse<User>> => {
    return useApiGet(`${API_ROUTE.auth.getProfile}`) as Promise<ApiResponse<User>>;
  },
  updateProfile: (payload: UserProfileUpdate): Promise<ApiResponse<User>> => {
    return useApiPut(`${API_ROUTE.auth.updateProfile}`, payload) as Promise<ApiResponse<User>>;
  },
  changePassword: (payload: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return useApiPut(`${API_ROUTE.auth.changePassword}`, payload) as Promise<ApiResponse<null>>;
  },
};
