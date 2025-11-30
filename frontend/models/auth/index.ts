export interface TRegisterPayload {
  full_name: string;
  phone: string;
  password: string;
  confirm_password: string;
  province: string;
}

export interface TLoginPayload {
  phone: string;
  password: string;
}

export interface TLoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
  error: null;
}

