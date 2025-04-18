import { LoginBody, LoginResponse } from '@/app/auth/login';
import { RegisterBody, RegisterResponse } from '@/app/auth/register';
import { AxiosClient } from '@/utils/axios';

const axiosClient = new AxiosClient();

export const login = async (payload: LoginBody) => {
  const response = await axiosClient.post<LoginBody, LoginResponse>('/account/login/', payload);
  return response.data;
};

export const register = async (payload: RegisterBody) => {
  const response = await axiosClient.post<RegisterBody, RegisterResponse>(
    '/account/register/',
    payload
  );
  return response.data;
};
