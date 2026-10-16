import { CATEGORY_CONFIG } from '@/constants'
import type { YearTable } from '@/types/worldView'

/** Build spreadsheet-friendly clipboard formats from the currently filtered table. */
export function buildWorldTableClipboard(table: YearTable): { text: string; html: string } {
  const rows = [
    ['分类', ...table.columns.map((column) => CATEGORY_CONFIG[column.category].label)],
    ['年份', ...table.columns.map((column) => column.conferenceName)],
    ...table.years.map((year, rowIndex) => [
      String(year),
      ...table.columns.map((_, colIndex) => {
        const cell = table.cells[rowIndex]?.[colIndex]
        return cell?.cityName ? [cell.cityName, cell.countryName].filter(Boolean).join(', ') : '—'
      }),
    ]),
  ]
  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }
      return entities[character] ?? character
    })

  return {
    text: rows
      .map((row) => row.map((value) => value.replace(/[\t\r\n]+/g, ' ')).join('\t'))
      .join('\n'),
    html: `<table>${rows
      .map(
        (row, index) =>
          `<tr>${row
            .map((value) => {
              const tag = index < 2 ? 'th' : 'td'
              return `<${tag}>${escapeHtml(value)}</${tag}>`
            })
            .join('')}</tr>`,
      )
      .join('')}</table>`,
  }
}
