import TodayPanel    from './panels/TodayPanel'
import ComingUpPanel from './panels/ComingUpPanel'
import GroceryPanel  from './panels/GroceryPanel'
import BulletinPanel from './panels/BulletinPanel'
import CalendarPanel from './panels/CalendarPanel'
import WhereAmIPanel from './panels/WhereAmIPanel'
import './Home.css'

export default function Home() {
  return (
    <div className="home-content">
      <TodayPanel />
      <ComingUpPanel />
      <GroceryPanel />
      <BulletinPanel />
      <CalendarPanel />
      <WhereAmIPanel />
    </div>
  )
}
