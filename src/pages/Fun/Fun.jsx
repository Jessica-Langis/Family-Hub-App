import Panel, { PanelHeader } from '../../components/Panel/Panel'

export default function Fun() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0 }}>
      <Panel>
        <PanelHeader title="Movies" />
        <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
          Porting in progress...
        </div>
      </Panel>
      <Panel>
        <PanelHeader title="Books" />
        <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
          Porting in progress...
        </div>
      </Panel>
      <Panel>
        <PanelHeader title="Meals" />
        <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
          Porting in progress...
        </div>
      </Panel>
    </div>
  )
}
