import Panel, { PanelHeader } from '../../components/Panel/Panel'

export default function Nova() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0 }}>
      <Panel>
        <PanelHeader title="Nova" />
        <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
          Porting in progress...
        </div>
      </Panel>
    </div>
  )
}
