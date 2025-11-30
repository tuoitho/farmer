// User model types matching backend schema

export interface User {
  id: string;
  full_name: string;
  phone: string;
  province: string;
  created_at: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  province?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}
