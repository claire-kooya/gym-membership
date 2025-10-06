import { useState } from 'react'
import { EligibleMember } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Send, SendHorizontal } from 'lucide-react'

interface EligibleMembersProps {
  members: EligibleMember[];
}

function EligibleMembers({ members }: EligibleMembersProps) {
  const [sending, setSending] = useState<{ [key: number]: boolean }>({})
  const [sendingAll, setSendingAll] = useState(false)

  const messageTemplate = `Hey {name}, we missed you last week on {last_attended_at}! It's been {days_since_attendance} days. Book your next class here: http://localhost:5173?action=book`

  const generateMessage = (member: EligibleMember) => {
    return messageTemplate
      .replace(/{name}/g, member.first_name)
      .replace(/{last_attended_at}/g, member.last_attended_at)
      .replace(/{days_since_attendance}/g, member.days_since_attendance.toString())
  }

  const handleSendMessage = async (member: EligibleMember) => {
    setSending(prev => ({ ...prev, [member.id]: true }))
    
    try {
      const message = generateMessage(member)
      
      // Check if it's a mock/example email
      if (member.email.includes('example.com')) {
        // Download as TXT file (simulation)
        downloadMessageAsTxt(member, message)
      } else {
        // Send via AWS SES for real emails
        await sendViaAWS(member, message)
      }
    } finally {
      setSending(prev => ({ ...prev, [member.id]: false }))
    }
  }

  const handleMessageAll = async () => {
    if (!confirm(`Send messages to all ${members.length} eligible members?`)) return
    
    setSendingAll(true)
    
    for (const member of members) {
      await handleSendMessage(member)
      // Small delay between sends
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setSendingAll(false)
    alert(`Sent messages to ${members.length} members!`)
  }

  const downloadMessageAsTxt = (member: EligibleMember, message: string) => {
    const filename = `message_${member.first_name}_${new Date().toISOString().split('T')[0]}.txt`
    const blob = new Blob([message], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    
    console.log(`Downloaded message for ${member.first_name} (${member.email})`)
  }

  const sendViaAWS = async (member: EligibleMember, message: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: member.email,
          subject: `${member.first_name}, we miss you at the gym!`,
          message: message,
          firstName: member.first_name,
          daysSince: member.days_since_attendance
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`Email sent to ${member.first_name} (${member.email}) via AWS SES`)
      } else {
        console.error(`Failed to send email to ${member.first_name}:`, data.error)
        alert(`Failed to send to ${member.first_name}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Error sending to ${member.first_name}. Check console for details.`)
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Eligible Members</h3>
        <p className="text-slate-500">Run a simulation to see eligible members for follow-up.</p>
      </div>
    )
  }

  return (
    <Card className="border-2 shadow-md bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Eligible for Follow-Up ({members.length})
            </CardTitle>
            <CardDescription>
              Members who haven't attended in 7-35 days with active membership
            </CardDescription>
          </div>
          <Button
            onClick={handleMessageAll}
            disabled={sendingAll}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all font-semibold"
          >
            {sendingAll ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-4 w-4" />
                Message All ({members.length})
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Attended
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Days Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold">
                          {member.first_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{member.first_name}</div>
                        <div className="text-xs text-slate-500">
                          {member.is_recurring ? 'Recurring' : 'Drop-in'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{member.email}</div>
                    <div className="text-xs text-slate-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {member.last_attended_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="warning">
                      {member.days_since_attendance} days
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.email.includes('example.com') ? (
                      <Badge variant="secondary" className="text-xs">
                        Simulation
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">
                        AWS Email
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      onClick={() => handleSendMessage(member)}
                      disabled={sending[member.id]}
                      size="sm"
                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all font-semibold"
                    >
                      {sending[member.id] ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default EligibleMembers