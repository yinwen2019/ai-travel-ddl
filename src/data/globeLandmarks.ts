import type { GlobeLandmark } from '@/types/globe'

// 地标是城市意象，不代表实际会议场馆；新增城市没有地标时仍正常显示统计点。
export const GLOBE_LANDMARKS: GlobeLandmark[] = [
  { cityKey: 'Paris, France', name: '埃菲尔铁塔', kind: 'eiffel' },
  { cityKey: 'Sydney, Australia', name: '悉尼歌剧院', kind: 'opera' },
  { cityKey: 'Seattle, United States', name: '太空针塔', kind: 'needle' },
  { cityKey: 'Singapore, Singapore', name: '滨海湾金沙', kind: 'marina' },
]
