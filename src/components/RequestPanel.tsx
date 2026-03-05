import type { ApiErrorState, BodyType, HttpMethod, KeyValuePair, RequestDraft } from '../types/api'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const BODY_TYPES: BodyType[] = ['json', 'text']

interface PairEditorProps {
  items: KeyValuePair[]
  label: string
  addLabel: string
  keyPlaceholder: string
  valuePlaceholder: string
  onAdd: () => void
  onChange: (id: string, updates: Partial<KeyValuePair>) => void
  onRemove: (id: string) => void
}

interface RequestPanelProps {
  draft: RequestDraft
  isSending: boolean
  requestError: ApiErrorState | null
  onMethodChange: (method: HttpMethod) => void
  onUrlChange: (url: string) => void
  onQueryParamChange: (id: string, updates: Partial<KeyValuePair>) => void
  onHeaderChange: (id: string, updates: Partial<KeyValuePair>) => void
  onAddQueryParam: () => void
  onAddHeader: () => void
  onRemoveQueryParam: (id: string) => void
  onRemoveHeader: (id: string) => void
  onBodyChange: (body: string) => void
  onBodyBlur: () => void
  onBodyTypeChange: (bodyType: BodyType) => void
  onFormatJson: () => void
  onSend: () => void
}

function PairEditor({
  items,
  label,
  addLabel,
  keyPlaceholder,
  valuePlaceholder,
  onAdd,
  onChange,
  onRemove,
}: PairEditorProps) {
  return (
    <section className="stack-lg">
      <div className="section-heading">
        <div>
          <h2>{label}</h2>
          <p className="muted-copy">Toggle rows on and off without deleting them.</p>
        </div>
        <button className="secondary-button" onClick={onAdd} type="button">
          {addLabel}
        </button>
      </div>

      <div className="pair-list">
        {items.map((item) => (
          <div className="pair-row" key={item.id}>
            <label className="toggle-chip">
              <input
                checked={item.enabled}
                onChange={(event) => onChange(item.id, { enabled: event.target.checked })}
                type="checkbox"
              />
              <span>{item.enabled ? 'On' : 'Off'}</span>
            </label>
            <input
              className="text-input"
              onChange={(event) => onChange(item.id, { key: event.target.value })}
              placeholder={keyPlaceholder}
              type="text"
              value={item.key}
            />
            <input
              className="text-input"
              onChange={(event) => onChange(item.id, { value: event.target.value })}
              placeholder={valuePlaceholder}
              type="text"
              value={item.value}
            />
            <button
              aria-label={`Remove ${label} row`}
              className="ghost-button"
              onClick={() => onRemove(item.id)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export function RequestPanel({
  draft,
  isSending,
  requestError,
  onMethodChange,
  onUrlChange,
  onQueryParamChange,
  onHeaderChange,
  onAddQueryParam,
  onAddHeader,
  onRemoveQueryParam,
  onRemoveHeader,
  onBodyChange,
  onBodyBlur,
  onBodyTypeChange,
  onFormatJson,
  onSend,
}: RequestPanelProps) {
  return (
    <div className="stack-xl">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Request Builder</p>
          <h2>Compose the request</h2>
        </div>
        <span className="helper-copy">Runs with browser `fetch()`.</span>
      </div>

      <div className="request-bar">
        <select
          aria-label="HTTP method"
          className="method-select"
          onChange={(event) => onMethodChange(event.target.value as HttpMethod)}
          value={draft.method}
        >
          {METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <input
          className="url-input"
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://api.example.com/v1/resource"
          type="url"
          value={draft.url}
        />
        <button className="primary-button" disabled={isSending} onClick={onSend} type="button">
          {isSending ? 'Sending...' : 'Send request'}
        </button>
      </div>

      <div className="info-callout">
        This app runs entirely on GitHub Pages, so the target API must allow CORS and any token
        you use must be pasted in at runtime.
      </div>

      {requestError ? (
        <div className="error-callout">
          <strong>{requestError.message}</strong>
          {requestError.details ? <span>{requestError.details}</span> : null}
        </div>
      ) : null}

      <PairEditor
        addLabel="Add param"
        items={draft.queryParams}
        keyPlaceholder="page"
        label="Query Params"
        onAdd={onAddQueryParam}
        onChange={onQueryParamChange}
        onRemove={onRemoveQueryParam}
        valuePlaceholder="2"
      />

      <PairEditor
        addLabel="Add header"
        items={draft.headers}
        keyPlaceholder="Authorization"
        label="Headers"
        onAdd={onAddHeader}
        onChange={onHeaderChange}
        onRemove={onRemoveHeader}
        valuePlaceholder="Bearer <token>"
      />

      <section className="stack-lg">
        <div className="section-heading">
          <div>
            <h2>Body</h2>
            <p className="muted-copy">JSON is auto-formatted on blur when valid.</p>
          </div>
          <div className="body-actions">
            <select
              aria-label="Body type"
              className="body-select"
              onChange={(event) => onBodyTypeChange(event.target.value as BodyType)}
              value={draft.bodyType}
            >
              {BODY_TYPES.map((bodyType) => (
                <option key={bodyType} value={bodyType}>
                  {bodyType.toUpperCase()}
                </option>
              ))}
            </select>
            <button className="secondary-button" onClick={onFormatJson} type="button">
              Format JSON
            </button>
          </div>
        </div>
        <textarea
          className="body-editor"
          onBlur={onBodyBlur}
          onChange={(event) => onBodyChange(event.target.value)}
          placeholder={'{\n  "name": "Example"\n}'}
          spellCheck={false}
          value={draft.body}
        />
        {draft.method === 'GET' ? (
          <p className="muted-copy">`GET` requests ignore the body editor in the browser.</p>
        ) : null}
      </section>
    </div>
  )
}
