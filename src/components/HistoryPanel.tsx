import type { ExecutedRequest } from '../types/api'

interface HistoryPanelProps {
  history: ExecutedRequest[]
  onLoadRequest: (entry: ExecutedRequest) => void
  onClear: () => void
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

export function HistoryPanel({ history, onLoadRequest, onClear }: HistoryPanelProps) {
  return (
    <div className="stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recent Requests</p>
          <h2>Local history</h2>
        </div>
        <button className="secondary-button" onClick={onClear} type="button">
          Clear history
        </button>
      </div>

      <p className="muted-copy">
        Requests are stored in this browser only. Nothing syncs to GitHub or a server.
      </p>

      {history.length === 0 ? (
        <div className="empty-panel compact">
          <h3>No history yet</h3>
          <p>Your most recent calls will show up here after you send a request.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <button
              className="history-card"
              key={entry.id}
              onClick={() => onLoadRequest(entry)}
              type="button"
            >
              <div className="history-card-header">
                <span className={`method-pill method-${entry.request.method.toLowerCase()}`}>
                  {entry.request.method}
                </span>
                <span className={`status-chip ${entry.ok ? 'success' : 'danger'}`}>
                  {entry.status ?? 'ERR'}
                </span>
              </div>
              <strong className="history-url">{entry.request.url}</strong>
              <div className="history-card-footer">
                <span>{formatTime(entry.executedAt)}</span>
                <span>{entry.durationMs} ms</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
