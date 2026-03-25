import Panel, { PanelHeader } from '../../components/Panel/Panel'
import './Home.css'

function PlaceholderBody({ label = 'Porting in progress...' }) {
  return <div className="placeholder-body">{label}</div>
}

export default function Home() {
  return (
    <div className="home-content">
      <Panel className="hg-today">
        <PanelHeader title="Today / Tomorrow" />
        <PlaceholderBody />
      </Panel>

      <Panel className="hg-comingup">
        <PanelHeader title="Coming Up" />
        <PlaceholderBody />
      </Panel>

      <Panel className="hg-grocery">
        <PanelHeader title="Grocery" />
        <PlaceholderBody />
      </Panel>

      <Panel className="hg-bulletin">
        <PanelHeader title="Bulletin" />
        <PlaceholderBody />
      </Panel>

      <Panel className="hg-calendar">
        <PanelHeader title="Calendar" />
        <PlaceholderBody />
      </Panel>

      <Panel className="hg-whereami">
        <PanelHeader title="Where Am I?" />
        <PlaceholderBody />
      </Panel>
    </div>
  )
}
