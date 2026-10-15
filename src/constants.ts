import type { Category, Continent } from '@/types/conference'

export const CONTINENT_LABELS: Record<Continent, string> = {
  Asia: '亚洲',
  Europe: '欧洲',
  'North America': '北美洲',
  'South America': '南美洲',
  Africa: '非洲',
  Oceania: '大洋洲',
}

export const CATEGORY_CONFIG: Record<Category, { label: string; short: string }> = {
  CV: { label: '计算机视觉', short: 'CV' },
  NLP: { label: '自然语言处理', short: 'NLP' },
  ML: { label: '机器学习', short: 'ML' },
  AI: { label: 'AI 综合', short: 'AI' },
  DM: { label: '数据挖掘', short: 'DM' },
}

export const CATEGORY_LIST: Category[] = ['CV', 'NLP', 'ML', 'AI', 'DM']

export const CATEGORY_COLORS: Record<Category, string> = {
  CV: '#EF4444',
  NLP: '#8B5CF6',
  ML: '#10B981',
  AI: '#3B82F6',
  DM: '#F59E0B',
}
