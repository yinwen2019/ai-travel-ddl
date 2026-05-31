import type { Category } from '@/types/conference'

export const CATEGORY_CONFIG: Record<Category, { label: string; short: string }> =
  {
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
