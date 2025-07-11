import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../constants';
import { BASE_API_URL } from '../../constants/env-vars';
import { MemoryStorage } from '../storage';
import { StorageInterface } from '../storage/storage.types';
import { AxiosClientProps } from './axios.types';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export class AxiosClient {
  _axiosClient: AxiosInstance;
  _storageClass: StorageInterface;
  _onAccessTokenExpire?: (error: AxiosError) => void;

  constructor({ baseUrl, axiosClient, storageClass, onAccessTokenExpire }: AxiosClientProps = {}) {
    this._axiosClient = axiosClient || axios.create({});
    this._axiosClient.defaults.baseURL = baseUrl || BASE_API_URL;

    this._storageClass = storageClass || new MemoryStorage();
    this._onAccessTokenExpire = onAccessTokenExpire || this.defaultOnAccessTokenExpire;

    this.mountInterceptors();
  }

  private async defaultOnAccessTokenExpire(error: AxiosError) {
    try {
      const refreshTokenResponse = await this._axiosClient.post('/account/token/refresh/', {
        refresh: await this._storageClass.getItem(REFRESH_TOKEN_KEY),
      });

      if (refreshTokenResponse.status === 200) {
        const { access, refresh } = refreshTokenResponse.data;
        await this._storageClass.setItem(ACCESS_TOKEN_KEY, access);
        await this._storageClass.setItem(REFRESH_TOKEN_KEY, refresh);
        try {
          const retryConfig = { ...error.config };
          const headers = new axios.AxiosHeaders(retryConfig.headers);
          headers.set('Authorization', `Bearer ${access}`);
          retryConfig.headers = headers;
          return this._axiosClient.request(retryConfig);
        } catch (retryError) {
          console.error('Error retrying request:', retryError);
          return Promise.reject(retryError);
        }
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      const storage = new MemoryStorage();
      await storage.removeItem(ACCESS_TOKEN_KEY);
      Alert.alert('Session Expired', 'Please log in again.');
      router.replace('/auth/login');
    }
  }

  private async mountInterceptors() {
    this._axiosClient.interceptors.request.use(async config => {
      const tokenExists = (await this._storageClass.getItem(ACCESS_TOKEN_KEY)) != null;

      if (tokenExists) {
        config.headers.Authorization = `Bearer ${await this._storageClass.getItem(
          ACCESS_TOKEN_KEY
        )}`;
      }

      return config;
    });

    // if response status is 401, call refresh token api and retry
    this._axiosClient.interceptors.response.use(
      response => response,
      async (error: AxiosError<Error>) => {
        if (error?.config && error?.response?.status === 401) {
          const tokenExists = (await this._storageClass.getItem(ACCESS_TOKEN_KEY)) != null;
          if (tokenExists) {
            this._onAccessTokenExpire?.(error);
          }
        }

        return Promise.reject(error);
      }
    );

    this._axiosClient.interceptors.request.use(config => {
      return config;
    });
  }

  custom(config: AxiosRequestConfig) {
    return this._axiosClient(config);
  }

  get<R = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'get', url, ...config });
  }

  post<T, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'post', url, data, ...config });
  }

  put<T, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'put', url, data, ...config });
  }

  patch<T, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'patch', url, data, ...config });
  }

  delete<R = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<R, R>> {
    return this.custom({ method: 'delete', url, ...config });
  }
}
