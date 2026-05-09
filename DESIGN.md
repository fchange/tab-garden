---
version: "1.0"
name: "Tab Garden / 枝理 Tab"
description: "A quiet, elegant browser tab manager for Chrome and Edge new tab pages."
colors:
  background-light: "#f6faf8"
  background-dark: "#1e2a35"
  foreground-light: "#243833"
  foreground-dark: "#edf6f4"
  accent-default: "#8e804b"
  accent-tian-shui-bi: "#8fbfaf"
  accent-ou-he: "#c98aa1"
  accent-yue-bai: "#8eb0c9"
  accent-dai-lan: "#3a6b73"
  accent-mo-se: "#517c73"
  accent-tengluozi: "#8076a3"
  accent-doukouzi: "#ad6598"
  accent-chengpihuang: "#fca104"
  accent-ruyahuang: "#ffc90c"
  accent-caohuilv: "#8e804b"
  accent-kongquelv: "#229453"
  accent-wasonglv: "#6e8b74"
  accent-yinhui: "#918072"
  accent-danlvhui: "#70887d"
  accent-wahui: "#867e76"
  accent-yanzhihong: "#f03f24"
  accent-meihong: "#c45a65"
  accent-yuanweilan: "#158bb8"
  error: "#dc2626"
  error-dark: "#ef4444"
typography:
  app-body:
    fontFamily: "SF Pro Display, SF Pro Text, PingFang SC, PingFang TC, Hiragino Sans GB, Segoe UI Variable, Segoe UI, Helvetica Neue, system-ui, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0"
  title-calligraphy:
    fontFamily: "chengrongguangke, SF Pro Display, PingFang SC, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.04em"
  label-md:
    fontFamily: "SF Pro Text, PingFang SC, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0"
  label-sm:
    fontFamily: "SF Pro Text, PingFang SC, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.01em"
  metadata:
    fontFamily: "SF Pro Text, PingFang SC, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  panel-gutter-desktop: "24px"
  panel-gutter-mobile: "16px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  panel: "20px"
  full: "999px"
components:
  shell-panel:
    backgroundColor: "{colors.background-light}"
    textColor: "{colors.foreground-light}"
    rounded: "{rounded.panel}"
    padding: "{spacing.xl}"
  search-input:
    typography: "{typography.app-body}"
    rounded: "{rounded.full}"
    height: "48px"
  view-toggle:
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: "34px"
  tab-row:
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  domain-card:
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  icon-button:
    rounded: "{rounded.lg}"
    size: "34px"
---

# Design System

## Overview

Tab Garden / 枝理 Tab 是一个接管浏览器 New Tab 的标签页整理工具。界面要像一张安静的工作台：信息清楚、动作克制、背景轻盈，帮助用户快速搜索、切换、关闭、休眠和合并重复标签。

整体气质是“东方色盘 + 现代玻璃面板 + 高密度列表”。不要做成营销落地页，不要加入大段说明文案，也不要用夸张插画抢走标签页内容的优先级。第一屏必须直接呈现可用的标签管理界面。

## Colors

- **Default light background** `#f6faf8`: 天水碧，作为默认浅色页面底色和波浪画布底色。
- **Default dark background** `#1e2a35`: 黛蓝，作为默认深色页面底色。
- **Primary text light** `#243833`: 用于主标签标题、统计数字和主要设置项。
- **Primary text dark** `#edf6f4`: 用于深色模式下的主文本。
- **Default accent** `#8e804b`: 草灰绿，当前默认强调色，用于活动视图、焦点环、顶部细线和悬浮色点。
- **Palette accents**: 天水碧 `#8fbfaf`、藕荷 `#c98aa1`、月白 `#8eb0c9`、黛蓝 `#3a6b73`、墨色 `#517c73`。
- **User accent swatches**: 藤萝紫、豆蔻紫、橙皮黄、乳鸭黄、草灰绿、孔雀绿、瓦松绿、银灰、淡绿灰、瓦灰、胭脂红、莓红、鸢尾蓝。色名应保留中文，辅助显示 hex 和拼音。
- **Destructive** `#dc2626` light / `#ef4444` dark: 只用于关闭、删除、重复标签等有损动作。

Surfaces rely on translucent whites or blacks rather than opaque blocks. In light mode, main cards use white with roughly 46-65 percent opacity. In dark mode, surfaces use near-black or white tints around 3-9 percent opacity. Accent color should be used sparingly for selection, focus, badges, action strips and animated waves.

## Typography

- **Base font**: system UI stack with Chinese fallbacks: SF Pro, PingFang SC/TC, Hiragino Sans GB, Segoe UI, Microsoft YaHei, Noto Sans CJK.
- **Calligraphic accent font**: `chengrongguangke` from `@chinese-fonts/crgkk`, only for color names or small poetic labels. Do not use it for dense tab titles or URLs.
- **Main tab title**: 15px, medium, single line with truncation.
- **URL and metadata**: 12-13px, regular or medium, muted and single line.
- **Header summary**: 16px, regular, with semibold numbers.
- **Controls**: 14-15px, medium.
- **Letter spacing**: keep at `0` for most UI text. Use subtle positive tracking only for decorative Chinese color labels or small badges.

Do not use hero-scale type inside the app shell. The product is a repeated-use utility, so text should feel compact, calm and scannable.

## Layout

- Main content is a centered panel with width `min(980px, calc(100vw - 48px))`; on mobile use `calc(100vw - 32px)`.
- Desktop panel top margin should breathe: `clamp(28px, 5vh, 60px)`. Mobile can reduce to 16px.
- Use one primary panel, not nested page cards. Repeated content may use tab rows and domain/window cards.
- The main panel order is: 3px accent strip, header summary, accent chooser, search, view toggle, optional batch action, scrollable content.
- All / Duplicate views are vertical lists with 4px row gaps.
- Domain / Window views are 3-column grids with 10px gaps, collapsing to 1 column below 720px.
- Scroll areas should stay inside the panel and avoid horizontal overflow. Keep all labels truncating cleanly.
- Floating controls live bottom-right and stay visually quiet until hover.

Spacing should follow a 4px rhythm. Common values are 4, 8, 12, 16, 24 and 32px. Avoid oversized empty sections because this is a work surface, not a brochure.

## Elevation & Depth

- Depth comes from translucent surfaces, backdrop blur, subtle borders and soft shadows.
- Main panel shadow: use a soft large shadow similar to `0 24px 80px rgba(30, 50, 45, 0.12)` in light mode or `0 24px 80px rgba(0, 0, 0, 0.28)` in dark mode.
- Inputs may use an inset highlight plus a soft outer shadow to reinforce the glass effect.
- Dropdowns and sheets can be more opaque than the main panel, but should still feel related to the current palette.
- The wave background is full-screen and animated unless disabled. It should feel like distant layered mountains, not a bright decorative pattern.

Motion should be gentle: 150-300ms for hover/action states, spring motion only for the active view indicator, and smooth color transitions when the accent changes.

## Shapes

- Main shell: 20px radius.
- Tab rows: 12-14px radius.
- Domain/window cards: 14px radius.
- Buttons and icon buttons: 8-10px radius unless intentionally pill-shaped.
- Search input, chips and segmented controls: full pill radius.
- Favicon fallbacks: 3-4px radius, compact and square.

Do not mix sharp and very rounded forms within the same control group. The app language is soft but not bubbly.

## Components

- **Wave background**: full viewport canvas. Use the resolved palette background and current accent color. Provide pause/play control and respect the `animationEnabled` setting.
- **Main panel**: translucent card with top accent strip, `backdrop-blur-sm`, border and soft shadow. It is the only large framed container on the page.
- **Header summary**: one quiet sentence summarizing open tabs, duplicates and sleeping tabs. Numbers are semibold.
- **Accent chooser**: dropdown trigger uses the calligraphic font and current accent color. The menu shows circular swatches, Chinese name, hex and pinyin. Current/default badges use the swatch color.
- **Search bar**: pill input, 48px tall, search icon at left, keyboard hint at right. It should be the strongest input affordance on the page.
- **View toggle**: pill segmented control with active background in the current accent color. Counts appear as small rounded badges.
- **Tab row**: favicon or fallback initial, title, URL, current/sleeping/duplicate/domain badges. Open and close actions appear on hover in an accent-colored action strip.
- **Domain/window card**: compact group surface with colored initial square, group label, tab count and overflow menu. Show up to five compact tabs, then a muted “more” row.
- **Batch destructive action**: only appears when useful. Use destructive color and include a small count badge.
- **Settings sheet**: right-side sheet with grouped sections for language, default view, theme, protections and whitelist. Controls should reuse pill buttons, inputs and badges.
- **Toast**: bottom-center, rounded pill, translucent card background, soft shadow.

## Do's and Don'ts

- Do keep the first screen immediately useful for tab management.
- Do reuse `--theme-*` CSS variables and the existing palette/accent token system before adding new values.
- Do use lucide icons for new icon buttons when possible.
- Do protect dense text with truncation, stable dimensions and responsive grid changes.
- Do keep destructive actions visually distinct but not alarmist.
- Don't add marketing hero sections, explanatory cards or decorative copy to the app screen.
- Don't introduce a one-color monotone UI. The base palette, accent and domain colors should create subtle variety.
- Don't use heavy gradients, orb backgrounds or unrelated illustrations.
- Don't make controls larger than their task requires.
- Don't add new fonts unless there is a clear product reason and Chinese fallback behavior is tested.
