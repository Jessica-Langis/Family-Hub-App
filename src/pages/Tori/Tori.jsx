import Panel, { PanelHeader } from '../../components/Panel/Panel'

export default function Tori() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0 }}>
      <Panel>
        <PanelHeader title="Tori" />
        <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
          Porting in progress...
        </div>
      </Panel>
    </div>
  )
}
