import type { GlobeLandmark } from '@/types/globe'

// 地标是城市意象，不代表实际会议场馆；新增城市没有地标时仍正常显示统计点。
export const GLOBE_LANDMARKS: GlobeLandmark[] = [
  {
    cityKey: 'Paris, France',
    name: '巴黎微缩景观',
    kind: 'eiffel',
    previewLabel: '巴黎',
    features: '埃菲尔铁塔 · 凯旋门 · 卢浮宫金字塔 · 塞纳河',
  },
  {
    cityKey: 'Hong Kong, China',
    name: '香港微缩景观',
    kind: 'hongkong',
    previewLabel: '香港',
    features: '中银大厦 · 国际金融中心二期 · 钟楼 · 天星小轮',
  },
  {
    cityKey: 'Vancouver, Canada',
    name: '温哥华微缩景观',
    kind: 'vancouver',
    previewLabel: '温哥华',
    features: '加拿大广场 · 海港中心 · 科学世界 · 海岸山林',
  },
  { cityKey: 'Sydney, Australia', name: '悉尼歌剧院', kind: 'opera' },
  { cityKey: 'Seattle, United States', name: '太空针塔', kind: 'needle' },
  { cityKey: 'Singapore, Singapore', name: '滨海湾金沙', kind: 'marina' },
]
