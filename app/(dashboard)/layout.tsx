import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col" style={{ marginLeft: 220, width: 'calc(100% - 220px)' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ backgroundColor: 'var(--background)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
