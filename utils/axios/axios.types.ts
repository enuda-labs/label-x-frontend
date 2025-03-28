import { AxiosInstance } from 'axios';

import { StorageInterface } from '../storage/storage.types';

export interface AxiosClientProps {
  baseUrl?: string;
  axiosClient?: AxiosInstance;
  storageClass?: StorageInterface;
  onAccessTokenExpire?: () => void;
}
