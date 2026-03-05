import type { ApiErrorCode, ApiErrorState, RequestDraft, ResponseData } from '../types/api'

const METHODS_WITHOUT_BODY = new Set(['GET'])

class ApiClientError extends Error implements ApiErrorState {
  code: ApiErrorCode
  details?: string

  constructor(code: ApiErrorCode, message: string, details?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.details = details
  }
}

const normalizeHeaders = (draft: RequestDraft) => {
  const headers = new Headers()

  draft.headers.forEach(({ enabled, key, value }) => {
    if (!enabled || key.trim() === '') {
      return
    }

    headers.set(key.trim(), value)
  })

  if (
    draft.bodyType === 'json' &&
    draft.body.trim() !== '' &&
    !headers.has('Content-Type') &&
    !METHODS_WITHOUT_BODY.has(draft.method)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

const buildUrl = (draft: RequestDraft) => {
  let url: URL

  try {
    url = new URL(draft.url)
  } catch {
    throw new ApiClientError(
      'invalid-url',
      'Enter a full URL, including the protocol, such as https://api.example.com/users.',
    )
  }

  draft.queryParams.forEach(({ enabled, key, value }) => {
    if (!enabled || key.trim() === '') {
      return
    }

    url.searchParams.set(key.trim(), value)
  })

  return url
}

const buildBody = (draft: RequestDraft) => {
  if (METHODS_WITHOUT_BODY.has(draft.method) || draft.body.trim() === '') {
    return undefined
  }

  if (draft.bodyType === 'json') {
    try {
      return JSON.stringify(JSON.parse(draft.body))
    } catch {
      throw new ApiClientError(
        'invalid-json-body',
        'Your request body is not valid JSON.',
        'Use valid JSON before sending the request.',
      )
    }
  }

  return draft.body
}

const parseBody = (bodyText: string, contentType: string) => {
  if (bodyText.trim() === '') {
    return null
  }

  const looksLikeJson =
    contentType.includes('application/json') ||
    contentType.includes('+json') ||
    bodyText.trim().startsWith('{') ||
    bodyText.trim().startsWith('[')

  if (!looksLikeJson) {
    return null
  }

  try {
    return JSON.parse(bodyText)
  } catch {
    return null
  }
}

export async function executeRequest(draft: RequestDraft): Promise<ResponseData> {
  const url = buildUrl(draft)
  const headers = normalizeHeaders(draft)
  const body = buildBody(draft)
  const startedAt = performance.now()

  try {
    const response = await fetch(url, {
      method: draft.method,
      headers,
      body,
    })

    const bodyText = await response.text()
    const durationMs = Math.round(performance.now() - startedAt)
    const contentType = response.headers.get('content-type') ?? ''
    const parsedBody = parseBody(bodyText, contentType)
    const sizeBytes = new TextEncoder().encode(bodyText).length

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs,
      sizeBytes,
      requestUrl: url.toString(),
      contentType,
      headers: Array.from(response.headers.entries()).map(([key, value]) => ({
        key,
        value,
      })),
      bodyText,
      parsedBody,
    }
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    const durationMs = Math.round(performance.now() - startedAt)
    const details =
      error instanceof Error ? error.message : 'Unknown browser fetch failure.'

    throw new ApiClientError(
      'cors',
      'The browser blocked the request or the network failed. If it works in Postman but not here, the API likely needs CORS enabled.',
      `Request failed after ${durationMs} ms. ${details}`,
    )
  }
}
