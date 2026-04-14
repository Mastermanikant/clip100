import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.frankbase.drop',
  appName: 'Frank Drop',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
