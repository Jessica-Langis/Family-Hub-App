import { useState } from 'react'
import TopBar    from './components/TopBar/TopBar'
import BottomNav from './components/BottomNav/BottomNav'
import Home      from './pages/Home/Home'
import Parentals from './pages/Parentals/Parentals'
import Tori      from './pages/Tori/Tori'
import Nova      from './pages/Nova/Nova'
import Fun       from './pages/Fun/Fun'

const PAGES = {
  home:      Home,
  parentals: Parentals,
  tori:      Tori,
  nova:      Nova,
  fun:       Fun,
}

const TAB_TITLES = {
  home:      'What Up Fam?',
  fun:       '⛺ Fun',
  parentals: '👨‍👩‍👧‍👦 Parentals',
  tori:      'Tori',
  nova:      'Nova',
}

const TAB_COLORS = {
  home:      'var(--accent)',
  fun:       'var(--accent5)',
  parentals: 'var(--accent2)',
  tori:      'var(--accent4)',
  nova:      'var(--accent3)',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const Page = PAGES[activeTab]

  return (
    <>
      <TopBar title={TAB_TITLES[activeTab]} titleColor={TAB_COLORS[activeTab]} />
      <main className="main-content">
        <Page />
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
