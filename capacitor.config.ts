import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kidloop.app',
  appName: 'Kidloop',
  webDir: 'capacitor-shell',
  server: {
    url: 'https://kidloop-fe.vercel.app',
    cleartext: false,
  },
}

export default config
