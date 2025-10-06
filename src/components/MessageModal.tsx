import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Send, Mail, MessageSquare, Sparkles } from 'lucide-react'
import { SkippedMember } from '../types'

interface MessageModalProps {
  member: SkippedMember
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MessageModal({ member, open, onOpenChange }: MessageModalProps) {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email')
  
  // Auto-populate with member's actual information
  const defaultSubject = `${member.first_name}, we miss you at the gym!`
  const defaultMessage = `Hey ${member.first_name}, 👋\n\nWe noticed you haven't been to the gym in ${member.days_since_attendance} days (last visit: ${member.last_attended_at}). We miss you! 💙\n\nBook your next class here 👉 http://localhost:5173?action=book\n\nNote: ${member.skip_reason}`
  
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(defaultMessage)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    
    try {
      // Check if it's a mock/example email
      if (member.email.includes('example.com')) {
        // Download as TXT file
        downloadMessageAsTxt(message, subject)
      } else {
        // Send via AWS
        await sendViaAWS(message, subject)
      }
      
      setSending(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Send error:', error)
      alert('Failed to send message')
      setSending(false)
    }
  }

  const downloadMessageAsTxt = (processedMessage: string, processedSubject: string) => {
    const content = `To: ${member.first_name} (${member.email})\nSubject: ${processedSubject}\n\n${processedMessage}`
    const filename = `message_${member.first_name}_${new Date().toISOString().split('T')[0]}.txt`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    
    console.log(`Downloaded message for ${member.first_name}`)
    alert(`Message downloaded as TXT file for ${member.first_name}!`)
  }

  const sendViaAWS = async (processedMessage: string, processedSubject: string) => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: member.email,
        subject: processedSubject,
        message: processedMessage,
        firstName: member.first_name,
        daysSince: member.days_since_attendance
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log(`Email sent to ${member.first_name} via AWS SES`)
      alert(`Email sent successfully to ${member.first_name}!`)
    } else {
      throw new Error(data.error || 'Failed to send email')
    }
  }

  const useTemplate = (type: 'motivational' | 'checkin' | 'offer') => {
    const templates = {
      motivational: `Hi ${member.first_name}! 💪\n\nYour fitness journey doesn't end here! We've noticed you've been away for ${member.days_since_attendance} days since ${member.last_attended_at}, and we miss seeing your dedication.\n\nRemember: Every champion was once a contender that refused to give up. Your goals are waiting for you!\n\nLet's get back to crushing those workouts together! 🔥\n\nReady when you are!`,
      checkin: `Hey ${member.first_name}, 👋\n\nIt's been ${member.days_since_attendance} days since we last saw you on ${member.last_attended_at}. I wanted to check in and make sure everything is okay.\n\nSometimes life gets busy, and that's completely understandable. If you're facing any challenges with your membership, schedule, or workouts, please let me know.\n\nWe're here to support you! 💙\n\nBest,\nYour Gym Team`,
      offer: `Hi ${member.first_name}! 🎁\n\nWe miss you! It's been ${member.days_since_attendance} days since ${member.last_attended_at}, and we'd love to welcome you back with a special offer.\n\n🎯 Free personal training session\n🎯 Guest pass for a friend\n🎯 Complimentary nutrition consultation\n\nLet's reconnect and help you achieve your fitness goals! 💪\n\nReply to claim your offer!`
    }
    
    setMessage(templates[type])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Send Personal Message to {member.first_name}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="warning" className="text-xs">
                {member.skip_reason}
              </Badge>
              <span className="text-slate-500">
                Last attended: {member.last_attended_at} ({member.days_since_attendance} days ago)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {member.email.includes('example.com') ? (
                <Badge variant="secondary" className="text-xs">
                  Will download as TXT file
                </Badge>
              ) : (
                <Badge variant="success" className="text-xs">
                  Will send via AWS Email
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message Type Selector */}
          <div className="space-y-2">
            <Label>Message Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={messageType === 'email' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMessageType('email')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                type="button"
                variant={messageType === 'sms' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMessageType('sms')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </Button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Quick Templates
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => useTemplate('motivational')}
                className="text-xs"
              >
                💪 Motivational
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => useTemplate('checkin')}
                className="text-xs"
              >
                👋 Check-in
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => useTemplate('offer')}
                className="text-xs"
              >
                🎁 Special Offer
              </Button>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="rounded-lg bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Recipient:</span>
              <span className="text-slate-900">{member.first_name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {messageType === 'email' ? 'Email:' : 'Phone:'}
              </span>
              <span className="text-slate-900">
                {messageType === 'email' ? member.email : member.phone}
              </span>
            </div>
          </div>

          {/* Subject (Email only) */}
          {messageType === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
          )}

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your personal message here..."
              className="min-h-[250px] resize-none"
            />
            <p className="text-xs text-slate-500">
              Message for {member.first_name} • {message.length} characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {sending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send {messageType === 'email' ? 'Email' : 'SMS'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
