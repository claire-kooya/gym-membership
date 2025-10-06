import { Users, UserX, FileText, BarChart3, Send, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: 'eligible' | 'skipped' | 'logs' | 'overview' | 'booking'
  setActiveTab: (tab: 'eligible' | 'skipped' | 'logs' | 'overview' | 'booking') => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'eligible' as const, label: 'Eligible Members', icon: Users },
    { id: 'skipped' as const, label: 'Skipped Members', icon: UserX },
    { id: 'logs' as const, label: 'Message Logs', icon: FileText },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
          <Dumbbell className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">GymFlow</h1>
          <p className="text-xs text-slate-500">Member Engagement</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400"
                )} 
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Send className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-slate-900">AWS Integrated</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">SNS & SES Ready</p>
        </div>
      </div>
    </aside>
  )
}
