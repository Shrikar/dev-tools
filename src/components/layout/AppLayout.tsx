import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="tool-page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
