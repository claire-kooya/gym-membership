import { useState, useEffect } from 'react'
import { Member, SimulationResult, LogEntry } from './types'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import EligibleMembers from './components/EligibleMembers'
import SkippedMembers from './components/SkippedMembers'
import MessageLog from './components/MessageLog'
import BookingScheduler from './components/BookingScheduler'
import { Button } from './components/ui/button'
import { Download, Trash2 } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'eligible' | 'skipped' | 'logs' | 'overview' | 'booking'>('overview')
  const [members, setMembers] = useState<Member[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Fetch all members on mount
  useEffect(() => {
    fetchMembers()
    fetchLogs()
    
    // Check if user came from booking link in email
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'book' || window.location.hash === '#book') {
      setActiveTab('booking')
    }
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs')
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const runSimulation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setSimulationResult(data)
      fetchLogs() // Refresh logs after simulation
      setActiveTab('eligible') // Switch to eligible tab to show results
    } catch (error) {
      console.error('Failed to run simulation:', error)
      alert('Failed to run simulation')
    } finally {
      setLoading(false)
    }
  }

  const sendViaAWS = async (method: 'sms' | 'email' | 'both') => {
    setDropdownOpen(false) // Close dropdown
    
    if (!confirm(`Are you sure you want to send messages via ${method.toUpperCase()}?\n\nThis will attempt to send real messages using AWS services.`)) {
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/send-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendVia: method })
      })
      const data = await response.json()
      
      setSimulationResult(data)
      fetchLogs()
      setActiveTab('logs') // Switch to logs to see results
      
      // Show result summary
      const successCount = data.sendResults?.filter((r: any) => 
        r.attempts.some((a: any) => a.success)
      ).length || 0
      
      alert(`AWS Send Complete!\n\nAttempted: ${data.eligible.length}\nSuccessful: ${successCount}\n\nCheck the logs tab for details.`)
    } catch (error) {
      console.error('Failed to send via AWS:', error)
      alert('Failed to send messages via AWS. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const exportLog = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `messages_log_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetLog = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return
    
    try {
      await fetch('/api/logs', { method: 'DELETE' })
      setLogs([])
      setSimulationResult(null)
      alert('Logs cleared successfully')
    } catch (error) {
      console.error('Failed to reset logs:', error)
      alert('Failed to reset logs')
    }
  }

  // Render booking page separately (no dashboard UI)
  if (activeTab === 'booking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50">
        <main className="p-8">
          <BookingScheduler />
        </main>
      </div>
    )
  }

  // Render main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'eligible' && 'Eligible Members'}
                {activeTab === 'skipped' && 'Skipped Members'}
                {activeTab === 'logs' && 'Message Logs'}
              </h2>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={exportLog}
                disabled={logs.length === 0}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={resetLog}
                disabled={logs.length === 0}
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {activeTab === 'overview' && (
            <Overview
              totalMembers={members.length}
              eligibleCount={simulationResult?.eligible.length || 0}
              skippedCount={simulationResult?.skipped.length || 0}
              totalLogs={logs.length}
              onRunSimulation={runSimulation}
              onSendViaAWS={sendViaAWS}
              loading={loading}
            />
          )}
          
          {activeTab === 'eligible' && (
            <div className="animate-in fade-in duration-500">
              <EligibleMembers members={simulationResult?.eligible || []} />
            </div>
          )}
          
          {activeTab === 'skipped' && (
            <div className="animate-in fade-in duration-500">
              <SkippedMembers members={simulationResult?.skipped || []} />
            </div>
          )}
          
          {activeTab === 'logs' && (
            <div className="animate-in fade-in duration-500">
              <MessageLog logs={logs} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App