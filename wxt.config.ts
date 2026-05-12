import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '枝理 Tab',
    description: '整理枝叶，也整理标签。',
    icons: {
      16: '/icons/icon-16.png',
      32: '/icons/icon-32.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png',
    },
    permissions: ['tabs', 'windows', 'storage', 'search'],
    host_permissions: ['https://v2.jinrishici.com/*'],
    action: {
      default_title: '枝理 Tab',
      default_icon: {
        16: '/icons/icon-16.png',
        32: '/icons/icon-32.png',
        48: '/icons/icon-48.png',
        128: '/icons/icon-128.png',
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
