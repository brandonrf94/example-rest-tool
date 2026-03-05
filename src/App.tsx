import { useEffect, useMemo, useState } from 'react'
import { HistoryPanel } from './components/HistoryPanel'
import { Layout } from './components/Layout'
import { RequestPanel } from './components/RequestPanel'
import { ResponsePanel } from './components/ResponsePanel'
import { executeRequest } from './lib/http'
import {
  appendHistoryEntry,
  loadDraft,
  loadHistory,
  loadTheme,
  saveDraft,
  saveHistory,
  saveTheme,
} from './lib/storage'
import type {
  ApiErrorState,
  ExecutedRequest,
  HttpMethod,
  KeyValuePair,
  RequestDraft,
  ResponseData,
  ThemeMode,
} from './types/api'

const formatJsonBody = (body: string) => JSON.stringify(JSON.parse(body), null, 2)

const createPair = (): KeyValuePair => ({
  id: crypto.randomUUID(),
  key: '',
  value: '',
  enabled: true,
})

const createDefaultDraft = (): RequestDraft => ({
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  queryParams: [createPair()],
  headers: [
    {
      id: crypto.randomUUID(),
      key: 'Accept',
      value: 'application/json',
      enabled: true,
    },
  ],
  body: '',
  bodyType: 'json',
})

function App() {
  const [draft, setDraft] = useState<RequestDraft>(() => loadDraft() ?? createDefaultDraft())
  const [history, setHistory] = useState<ExecutedRequest[]>(() => loadHistory())
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [requestError, setRequestError] = useState<ApiErrorState | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  useEffect(() => {
    saveHistory(history)
  }, [history])

  const updateDraft = (updater: (current: RequestDraft) => RequestDraft) => {
    setRequestError(null)
    setDraft((current) => updater(current))
  }

  const updateListItem = (
    field: 'queryParams' | 'headers',
    id: string,
    updates: Partial<KeyValuePair>,
  ) => {
    updateDraft((current) => ({
      ...current,
      [field]: current[field].map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }))
  }

  const addListItem = (field: 'queryParams' | 'headers') => {
    updateDraft((current) => ({
      ...current,
      [field]: [...current[field], createPair()],
    }))
  }

  const removeListItem = (field: 'queryParams' | 'headers', id: string) => {
    updateDraft((current) => {
      const nextItems = current[field].filter((item) => item.id !== id)
      return {
        ...current,
        [field]: nextItems.length > 0 ? nextItems : [createPair()],
      }
    })
  }

  const handleMethodChange = (method: HttpMethod) => {
    updateDraft((current) => ({ ...current, method }))
  }

  const handleThemeToggle = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const handleBodyBlur = () => {
    if (draft.bodyType !== 'json' || draft.body.trim() === '') {
      return
    }

    try {
      const formatted = formatJsonBody(draft.body)
      updateDraft((current) => ({ ...current, body: formatted }))
    } catch {
      // Keep the raw body untouched until the user explicitly sends or formats it.
    }
  }

  const handleFormatJson = () => {
    if (draft.body.trim() === '') {
      return
    }

    try {
      const formatted = formatJsonBody(draft.body)
      updateDraft((current) => ({ ...current, body: formatted }))
      setRequestError(null)
    } catch {
      setRequestError({
        code: 'invalid-json-body',
        message: 'Your JSON body is invalid. Fix it before formatting or sending.',
      })
    }
  }

  const recordHistory = (
    nextResponse: ResponseData | null,
    nextError: ApiErrorState | null,
    durationMs: number,
  ) => {
    const entry: ExecutedRequest = {
      id: crypto.randomUUID(),
      request: draft,
      executedAt: new Date().toISOString(),
      durationMs,
      status: nextResponse?.status ?? null,
      statusText: nextResponse?.statusText ?? '',
      ok: nextResponse?.ok ?? false,
      error: nextError ?? undefined,
    }

    setHistory((current) => appendHistoryEntry(current, entry))
  }

  const handleSend = async () => {
    setIsSending(true)
    setRequestError(null)

    try {
      const nextResponse = await executeRequest(draft)
      setResponse(nextResponse)
      recordHistory(nextResponse, null, nextResponse.durationMs)
    } catch (error) {
      const fallbackError: ApiErrorState = {
        code: 'network',
        message: 'The request failed before a response was returned.',
      }
      const nextError =
        error instanceof Error && 'code' in error
          ? (error as ApiErrorState)
          : fallbackError

      setResponse(null)
      setRequestError(nextError)
      recordHistory(null, nextError, 0)
    } finally {
      setIsSending(false)
    }
  }

  const handleLoadHistory = (entry: ExecutedRequest) => {
    setDraft(entry.request)
    setResponse(null)
    setRequestError(entry.error ?? null)
  }

  const handleClearHistory = () => {
    setHistory([])
  }

  const headerSubtitle = useMemo(
    () =>
      'A browser-first client for public APIs, local services, and any endpoint with CORS enabled.',
    [],
  )

  return (
    <Layout
      toolbar={(
        <>
          <div>
            <p className="eyebrow">GitHub Pages REST Client</p>
            <h1>Send REST requests without leaving the browser.</h1>
            <p className="toolbar-copy">{headerSubtitle}</p>
          </div>
          <div className="toolbar-actions">
            <p className="toolbar-note">Static app. Local history. Browser CORS rules apply.</p>
            <button className="secondary-button" onClick={handleThemeToggle} type="button">
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </button>
          </div>
        </>
      )}
      requestPanel={(
        <RequestPanel
          draft={draft}
          isSending={isSending}
          requestError={requestError}
          onAddHeader={() => addListItem('headers')}
          onAddQueryParam={() => addListItem('queryParams')}
          onBodyBlur={handleBodyBlur}
          onBodyChange={(body) => updateDraft((current) => ({ ...current, body }))}
          onBodyTypeChange={(bodyType) =>
            updateDraft((current) => ({ ...current, bodyType }))
          }
          onFormatJson={handleFormatJson}
          onHeaderChange={(id, updates) => updateListItem('headers', id, updates)}
          onMethodChange={handleMethodChange}
          onQueryParamChange={(id, updates) => updateListItem('queryParams', id, updates)}
          onRemoveHeader={(id) => removeListItem('headers', id)}
          onRemoveQueryParam={(id) => removeListItem('queryParams', id)}
          onSend={handleSend}
          onUrlChange={(url) => updateDraft((current) => ({ ...current, url }))}
        />
      )}
      responsePanel={(
        <ResponsePanel
          error={requestError}
          isSending={isSending}
          response={response}
        />
      )}
      historyPanel={(
        <HistoryPanel
          history={history}
          onClear={handleClearHistory}
          onLoadRequest={handleLoadHistory}
        />
      )}
    />
  )
}

export default App
