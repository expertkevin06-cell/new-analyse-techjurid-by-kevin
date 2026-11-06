import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kevin83600.expertauto',
  appName: 'Expert Auto Pro Unifié',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: []
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    BackgroundRunner: {
      enabled: true,
      label: 'AutoUpdate15Days',
      period: 1296000000, // 15 jours en millisecondes
      repeat: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a"
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'keystore/expertauto.keystore',
      keystoreAlias: 'expertauto'
    }
  }
};

export default config;
