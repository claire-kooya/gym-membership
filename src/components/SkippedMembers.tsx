import { useState } from 'react'
import { SkippedMember } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, MessageSquare } from 'lucide-react'
import MessageModal from './MessageModal'

interface SkippedMembersProps {
  members: SkippedMember[];
}

function SkippedMembers({ members }: SkippedMembersProps) {
  const [selectedMember, setSelectedMember] = useState<SkippedMember | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSendMessage = (member: SkippedMember) => {
    setSelectedMember(member)
    setModalOpen(true)
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Skipped Members</h3>
        <p className="text-slate-500">Run a simulation to see skipped members and reasons.</p>
      </div>
    )
  }

  return (
    <>
      <Card className="border-2 shadow-md bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Skipped Members ({members.length})
          </CardTitle>
          <CardDescription>
            Members excluded from automated follow-up requiring personal attention
          </CardDescription>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Attended
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Days Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Skip Reason
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
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-slate-600 font-semibold">
                            {member.first_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{member.first_name}</div>
                          <div className="text-xs text-slate-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          member.membership_status === 'active'
                            ? 'success'
                            : member.membership_status === 'frozen'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {member.membership_status.charAt(0).toUpperCase() + member.membership_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {member.last_attended_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">
                        {member.days_since_attendance} days
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <span className="text-sm text-slate-700">{member.skip_reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => handleSendMessage(member)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all font-semibold"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Message Modal */}
      {selectedMember && (
        <MessageModal
          member={selectedMember}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  )
}

export default SkippedMembers