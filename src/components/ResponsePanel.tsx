import { useMemo, useState } from 'react'
import type { ApiErrorState, ResponseData } from '../types/api'

interface ResponsePanelProps {
  response: ResponseData | null
  error: ApiErrorState | null
  isSending: boolean
}

const formatBytes = (value: number) => {
  if (value < 1024) {
    return `${value} B`
  }

  return `${(value / 1024).toFixed(1)} KB`
}

const copyText = async (value: string) => {
  await navigator.clipboard.writeText(value)
}

export function ResponsePanel({ response, error, isSending }: ResponsePanelProps) {
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedHeaders, setCopiedHeaders] = useState(false)

  const formattedBody = useMemo(() => {
    if (!response) {
      return ''
    }

    if (response.parsedBody !== null) {
      return JSON.stringify(response.parsedBody, null, 2)
    }

    return response.bodyText || 'No response body returned.'
  }, [response])

  const headerText = useMemo(() => {
    if (!response) {
      return ''
    }

    return response.headers.map(({ key, value }) => `${key}: ${value}`).join('\n')
  }, [response])

  const handleCopyBody = async () => {
    await copyText(formattedBody)
    setCopiedBody(true)
    window.setTimeout(() => setCopiedBody(false), 1600)
  }

  const handleCopyHeaders = async () => {
    await copyText(headerText)
    setCopiedHeaders(true)
    window.setTimeout(() => setCopiedHeaders(false), 1600)
  }

  return (
    <div className="stack-xl">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Response Viewer</p>
          <h2>Inspect the response</h2>
        </div>
        {response ? (
          <div className="response-meta">
            <span className={`status-chip ${response.ok ? 'success' : 'danger'}`}>
              {response.status} {response.statusText}
            </span>
            <span className="meta-pill">{response.durationMs} ms</span>
            <span className="meta-pill">{formatBytes(response.sizeBytes)}</span>
          </div>
        ) : null}
      </div>

      {isSending ? (
        <div className="loading-panel">
          <div className="loading-bar" />
          <p>Sending request and waiting for the browser response...</p>
        </div>
      ) : null}

      {!isSending && !response && !error ? (
        <div className="empty-panel">
          <h3>No response yet</h3>
          <p>
            Send a request to view the status, headers, body, size, and timing all in one place.
          </p>
        </div>
      ) : null}

      {!isSending && error ? (
        <div className="error-callout">
          <strong>{error.message}</strong>
          {error.details ? <span>{error.details}</span> : null}
        </div>
      ) : null}

      {response ? (
        <div className="stack-lg">
          <div className="result-section">
            <div className="section-heading">
              <div>
                <h3>Response Body</h3>
                <p className="muted-copy">{response.contentType || 'Unknown content type'}</p>
              </div>
              <button className="secondary-button" onClick={handleCopyBody} type="button">
                {copiedBody ? 'Copied' : 'Copy body'}
              </button>
            </div>
            <pre className="response-block">{formattedBody}</pre>
          </div>

          <div className="result-grid">
            <div className="result-section">
              <div className="section-heading">
                <div>
                  <h3>Headers</h3>
                  <p className="muted-copy">{response.headers.length} returned</p>
                </div>
                <button className="secondary-button" onClick={handleCopyHeaders} type="button">
                  {copiedHeaders ? 'Copied' : 'Copy headers'}
                </button>
              </div>
              <pre className="response-block">{headerText || 'No response headers returned.'}</pre>
            </div>

            <div className="result-section">
              <div className="section-heading">
                <div>
                  <h3>Summary</h3>
                  <p className="muted-copy">Quick request diagnostics.</p>
                </div>
              </div>
              <dl className="summary-list">
                <div>
                  <dt>Requested URL</dt>
                  <dd>{response.requestUrl}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    {response.status} {response.statusText}
                  </dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{response.durationMs} ms</dd>
                </div>
                <div>
                  <dt>Payload size</dt>
                  <dd>{formatBytes(response.sizeBytes)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
