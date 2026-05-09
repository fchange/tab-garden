import type { ColorSample } from '../types/settings';

export const DEFAULT_ACCENT_COLOR = '#8e804b';

export const ACCENT_COLORS: ColorSample[] = [
  {
    hex: '#8076a3',
    name: '藤萝紫',
    pinyin: 'tengluozi',
  },
  {
    hex: '#ad6598',
    name: '豆蔻紫',
    pinyin: 'doukouzi',
  },
  {
    hex: '#fca104',
    name: '橙皮黄',
    pinyin: 'chengpihuang',
  },
  {
    hex: '#ffc90c',
    name: '乳鸭黄',
    pinyin: 'ruyahuang',
  },
  {
    hex: '#8e804b',
    name: '草灰绿',
    pinyin: 'caohuilv',
  },
  {
    hex: '#229453',
    name: '孔雀绿',
    pinyin: 'kongquelv',
  },
  {
    hex: '#6e8b74',
    name: '瓦松绿',
    pinyin: 'wasonglv',
  },
  {
    hex: '#918072',
    name: '银灰',
    pinyin: 'yinhui',
  },
  {
    hex: '#70887d',
    name: '淡绿灰',
    pinyin: 'danlvhui',
  },
  {
    hex: '#867e76',
    name: '瓦灰',
    pinyin: 'wahui',
  },
  {
    hex: '#f03f24',
    name: '胭脂红',
    pinyin: 'yanzhihong',
  },
  {
    hex: '#c45a65',
    name: '莓红',
    pinyin: 'meihong',
  },
  {
    hex: '#158bb8',
    name: '鸢尾蓝',
    pinyin: 'yuanweilan',
  },
];

export function getAccentColorByHex(hex?: string): ColorSample {
  return (
    ACCENT_COLORS.find((color) => color.hex === hex) ??
    ACCENT_COLORS.find((color) => color.hex === DEFAULT_ACCENT_COLOR) ??
    ACCENT_COLORS[0]
  );
}

export function getNextAccentColor(hex: string): ColorSample {
  const index = ACCENT_COLORS.findIndex((color) => color.hex === hex);
  return ACCENT_COLORS[(index + 1 + ACCENT_COLORS.length) % ACCENT_COLORS.length];
}
