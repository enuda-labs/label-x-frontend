import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageInterface } from './storage.types';

export class MemoryStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async checkItem(key: string): Promise<boolean> {
    return ['', null].includes(await this.getItem(key));
  }
}
