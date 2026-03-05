export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type BodyType = 'json' | 'text'

export type ThemeMode = 'dark' | 'light'

export type ApiErrorCode =
  | 'cors'
  | 'invalid-json-body'
  | 'invalid-url'
  | 'network'
  | 'unknown'

export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface RequestDraft {
  method: HttpMethod
  url: string
  queryParams: KeyValuePair[]
  headers: KeyValuePair[]
  body: string
  bodyType: BodyType
}

export interface ApiErrorState {
  code: ApiErrorCode
  message: string
  details?: string
}

export interface ResponseHeader {
  key: string
  value: string
}

export interface ResponseData {
  ok: boolean
  status: number
  statusText: string
  durationMs: number
  sizeBytes: number
  requestUrl: string
  contentType: string
  headers: ResponseHeader[]
  bodyText: string
  parsedBody: unknown | null
}

export interface ExecutedRequest {
  id: string
  request: RequestDraft
  executedAt: string
  durationMs: number
  status: number | null
  statusText: string
  ok: boolean
  error?: ApiErrorState
}
