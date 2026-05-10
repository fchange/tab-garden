# Tab Garden / 枝理 Tab

<p align="center">
  <img src="./public/logo.png" alt="Tab Garden logo" width="220" />
</p>

Tab Garden（枝理 Tab）是一个基于 WXT + React + TypeScript + Tailwind CSS 构建的 Chrome / Edge Manifest V3 浏览器扩展。

它只做一件事：把当前浏览器里的标签页整理得更安静、更清楚、更轻盈。

## 功能概览

- 使用 `chrome_url_overrides.newtab` 接管 New Tab 页面
- 点击浏览器工具栏图标会直接打开一个独立窗口
- 读取当前所有窗口的标签页并实时展示
- 支持按标题和 URL 搜索
- 支持 4 种视图：全部 / 域名 / 窗口 / 重复
- 支持切换、关闭、休眠单个标签
- 支持一键关闭重复标签
- 支持一键释放闲置标签
- 支持域名组操作：只保留一个 / 关闭重复 / 休眠本组
- 支持窗口组操作：关闭重复 / 休眠本组
- 使用 `chrome.storage.local` 持久化设置
- 支持浅色 / 深色主题与东方色盘
- 支持关闭背景波浪动画
- 支持通过今日诗词 API 展示底部诗文
- 非扩展环境下自动回退到 mock 数据预览

## 技术栈

- [WXT](https://wxt.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- Chrome Extension Manifest V3

## 权限

项目只申请以下权限：

- `tabs`
- `windows`
- `storage`

没有申请：

- `scripting`
- `activeTab`
- `content_scripts`

站点访问权限：

- `https://v2.jinrishici.com/*`：用于“展示诗文”功能，从今日诗词 API 获取诗词名句。

## 快速开始

```bash
pnpm install
pnpm dev
```

开发 Edge 版本：

```bash
pnpm dev:edge
```

构建 Chrome 版本：

```bash
pnpm build
```

构建 Edge 版本：

```bash
pnpm build:edge
```

## 加载扩展

Chrome：

1. 打开 `chrome://extensions`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择 `.output/chrome-mv3`

Edge：

1. 打开 `edge://extensions`
2. 开启“开发人员模式”
3. 点击“加载解压缩的扩展”
4. 选择 `.output/edge-mv3`

加载完成后，新开一个标签页即可看到 Tab Garden / 枝理 Tab 主界面。

## 脚本

- `pnpm dev`：启动 Chrome 开发模式
- `pnpm dev:edge`：启动 Edge 开发模式
- `pnpm build`：构建 Chrome MV3 产物
- `pnpm build:edge`：构建 Edge MV3 产物
- `pnpm zip`：打包扩展
- `pnpm typecheck`：运行 TypeScript 类型检查

## 项目结构

```text
entrypoints/
  background.ts
  newtab/
    index.html
    main.tsx

src/
  components/
  hooks/
  lib/
  types/
  App.tsx
  styles.css
```

核心模块说明：

- `src/hooks/useTabs.ts`：标签查询、监听、刷新与批量动作
- `src/hooks/useSettings.ts`：设置加载、更新、持久化
- `src/lib/url.ts`：URL 标准化、域名提取、特殊页面安全处理
- `src/lib/groups.ts`：搜索过滤、域名分组、窗口分组
- `src/lib/tabs.ts`：重复检测、保留策略、关闭与休眠逻辑
- `src/components/*`：新标签页 UI 组件

## 当前实现说明

- 重复标签判断基于 `normalizeUrl(url)`，会移除 hash、尾部 slash 和常见追踪参数
- 域名分组会识别常见二级公共后缀，例如 `google.com.hk`、`google.co.uk`
- 默认保护固定标签、正在播放音频的标签、当前活跃标签和白名单域名
- 不使用后端、IndexedDB、Dexie、AI API、content script
- 不读取网页正文，不申请任何站点权限

## 验证结果

已在本地完成以下验证：

- `pnpm install`
- `pnpm typecheck`
- `pnpm build`
- `pnpm build:edge`

## 可继续扩展的方向

- 增加一个极简 popup，显示重复标签数量与快速入口
- 为域名分组增加更细致的公共后缀判断
- 在重复关闭前增加更明显的确认层
- 增加导入 / 导出设置

## TODO

- 字体：字体引入、基础字体栈和点缀字体变量统一集中在 `src/styles/点缀字体.css`；`font-ornament-1` 当前为 ZeoSeven CDN 的 `Huiwen-mincho`，用于底部诗文；`font-ornament-2` 当前为 `chengrongguangke`，用于颜色名称和颜色选择弹窗。
- 字体：Chrome 扩展正式发布前，确认远程字体的授权、CSP、隐私和离线表现；如需上架，优先改成本地打包的 `woff2` 子集。
