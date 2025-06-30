import { LoginBody, LoginResponse } from '@/app/auth/login';
import { RegisterBody, RegisterResponse } from '@/app/auth/register';
import { AxiosClient } from '@/utils/axios';

// Constants
const axiosClient = new AxiosClient();

// 2FA Types
interface TwoFASetupData {
  qr_code_url: string;
  secret_key: string;
  is_verified: boolean;
}

interface TwoFASetupAPIResponse {
  status: string;
  data: TwoFASetupData;
  message: string | null;
  success: boolean;
}

interface Verify2FAAPIResponse {
  status: string;
  data: { is_verified: boolean };
  message: string | null;
  success: boolean;
}

interface Disable2FAAPIResponse {
  status: string;
  data: { disabled: boolean };
  message: string | null;
  success: boolean;
}

// ✅ Change Password Types
export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  status: string;
  data: null;
  message: string | null;
  success: boolean;
}

// ✅ Update Username Types
export interface UpdateUsernameBody {
  username: string;
}

export interface UpdateUsernameResponse {
  status: string;
  message: string | null;
  success: boolean;
}

// ✅ Login
export const login = async (payload: LoginBody): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginBody, LoginResponse>('/account/login/', payload);
  return response.data;
};

// ✅ Register
export const register = async (payload: RegisterBody): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterBody, RegisterResponse>(
    '/account/register/',
    payload
  );
  return response.data;
};

// ✅ Get 2FA Setup Info
export const get2FASetup = async (): Promise<TwoFASetupData> => {
  const response = await axiosClient.get<TwoFASetupAPIResponse>('/account/2fa/setup/');
  return response.data.data;
};

// ✅ Verify OTP Code to Enable 2FA
export const verify2FASetup = async (otp_code: string): Promise<boolean> => {
  const response = await axiosClient.post<{ otp_code: string }, Verify2FAAPIResponse>(
    '/account/2fa/setup/',
    { otp_code }
  );

  if (response.data.success && response.data.data?.is_verified === true) {
    return true;
  }

  // Hacky fallback: assume success if `data` is null but message says it's verified
  if (response.data.success && response.data.message?.toLowerCase().includes('verified')) {
    return true;
  }

  console.warn('verify2FASetup: unexpected response', response.data);
  return false;
};

// ✅ Disable 2FA with password
export const disable2FASetup = async (password: string): Promise<boolean> => {
  const response = await axiosClient.post<{ password: string }, Disable2FAAPIResponse>(
    '/account/2fa/disable/',
    { password }
  );

  // Check based on the `success` field instead of `data.disabled`
  return response.data.success;
};

// ✅ Change Password
export const changePassword = async (
  payload: ChangePasswordBody
): Promise<ChangePasswordResponse> => {
  const response = await axiosClient.post<ChangePasswordBody, ChangePasswordResponse>(
    '/account/change-password/',
    payload
  );
  return response.data;
};

export const updateUsername = async (
  payload: UpdateUsernameBody
): Promise<UpdateUsernameResponse> => {
  const response = await axiosClient.post<UpdateUsernameBody, UpdateUsernameResponse>(
    '/account/update-username/',
    payload
  );
  return response.data;
};
