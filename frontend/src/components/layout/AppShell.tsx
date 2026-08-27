import { Outlet } from 'react-router-dom'
import Footer from './Footer'

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-950">
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}
