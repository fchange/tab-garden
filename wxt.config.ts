import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'wxt';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

const getDisplayVersion = (mode: string) =>
  mode === 'dev' ? `${packageJson.version}-dev` : packageJson.version;

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ mode }) => ({
    name: '枝理 Tab',
    description: '整理枝叶，也整理标签。',
    version: packageJson.version,
    ...(mode === 'dev' && { version_name: getDisplayVersion(mode) }),
    icons: {
      16: '/icons/icon-16.png',
      32: '/icons/icon-32.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png',
    },
    permissions: ['tabs', 'windows', 'storage', 'search', 'bookmarks', 'favicon'],
    action: {
      default_title: '枝理 Tab',
      default_icon: {
        16: '/icons/icon-16.png',
        32: '/icons/icon-32.png',
        48: '/icons/icon-48.png',
        128: '/icons/icon-128.png',
      },
    },
  }),
  vite: ({ mode }) => ({
    define: {
      __APP_VERSION__: JSON.stringify(getDisplayVersion(mode)),
    },
    plugins: [tailwindcss()],
  }),
});
