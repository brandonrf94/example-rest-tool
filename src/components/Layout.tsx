import type { ReactNode } from 'react'

interface LayoutProps {
  toolbar: ReactNode
  requestPanel: ReactNode
  responsePanel: ReactNode
  historyPanel: ReactNode
}

export function Layout({
  toolbar,
  requestPanel,
  responsePanel,
  historyPanel,
}: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="topbar">{toolbar}</header>
      <main className="workspace">
        <section className="panel request-panel">{requestPanel}</section>
        <section className="panel response-panel">{responsePanel}</section>
      </main>
      <aside className="panel history-panel">{historyPanel}</aside>
    </div>
  )
}
