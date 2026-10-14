export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const sec = Math.round(diffMs / 1000)
  const min = Math.round(sec / 60)
  const hour = Math.round(min / 60)
  const day = Math.round(hour / 24)

  if (sec < 60) return 'agora'
  if (min < 60) return rtf.format(-min, 'minute')
  if (hour < 24) return rtf.format(-hour, 'hour')
  if (day < 30) return rtf.format(-day, 'day')
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
