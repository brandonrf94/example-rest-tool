import type { ExecutedRequest, RequestDraft, ThemeMode } from '../types/api'

const DRAFT_KEY = 'rest-client-pages:draft'
const HISTORY_KEY = 'rest-client-pages:history'
const THEME_KEY = 'rest-client-pages:theme'
const HISTORY_LIMIT = 12

const hasWindow = () => typeof window !== 'undefined'

const readJson = <T>(key: string): T | null => {
  if (!hasWindow()) {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : null
  } catch {
    return null
  }
}

const writeJson = (key: string, value: unknown) => {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export const loadDraft = () => readJson<RequestDraft>(DRAFT_KEY)

export const saveDraft = (draft: RequestDraft) => {
  writeJson(DRAFT_KEY, draft)
}

export const loadHistory = () => readJson<ExecutedRequest[]>(HISTORY_KEY) ?? []

export const saveHistory = (history: ExecutedRequest[]) => {
  writeJson(HISTORY_KEY, history)
}

export const appendHistoryEntry = (
  history: ExecutedRequest[],
  entry: ExecutedRequest,
) => [entry, ...history].slice(0, HISTORY_LIMIT)

export const loadTheme = (): ThemeMode => {
  const storedTheme = readJson<ThemeMode>(THEME_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  if (hasWindow() && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export const saveTheme = (theme: ThemeMode) => {
  writeJson(THEME_KEY, theme)
}
