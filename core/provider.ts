
import { DataProvider } from './dataProvider';
import { GoogleSheetProvider } from '../providers/googleSheetProvider';

// Singleton instance
let providerInstance: DataProvider | null = null;

export const getProvider = (): DataProvider => {
  if (!providerInstance) {
    providerInstance = new GoogleSheetProvider();
    providerInstance.init();
  }
  return providerInstance;
};
