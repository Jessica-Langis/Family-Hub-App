import Panel, { PanelHeader } from '../../components/Panel/Panel'
import './Parentals.css'

export default function Parentals() {
  return (
    <div className="tab-layout">
      <Panel>
        <PanelHeader title="Chores" />
        <div className="placeholder-body">Porting in progress...</div>
      </Panel>
      <Panel>
        <PanelHeader title="Meal Plan" />
        <div className="placeholder-body">Porting in progress...</div>
      </Panel>
    </div>
  )
}
