// 格式由 JSON Schema 检查；Intl 检查时区是否真实存在。
export function isKnownTimezone(value) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value })
    return true
  } catch {
    return false
  }
}
