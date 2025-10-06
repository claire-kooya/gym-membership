import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, UserX, FileText, TrendingUp, Activity, Send } from 'lucide-react'

interface OverviewProps {
  totalMembers: number
  eligibleCount: number
  skippedCount: number
  totalLogs: number
  onRunSimulation: () => void
  onSendViaAWS: (method: 'sms' | 'email' | 'both') => void
  loading: boolean
}

export default function Overview({
  totalMembers,
  eligibleCount,
  skippedCount,
  totalLogs,
  onRunSimulation,
  onSendViaAWS,
  loading
}: OverviewProps) {
  const stats = [
    {
      title: 'Total Members',
      value: totalMembers,
      change: '+12%',
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Eligible to Contact',
      value: eligibleCount,
      change: '+8%',
      icon: Activity,
      color: 'green',
      bgGradient: 'from-green-500/10 to-green-600/10',
      iconColor: 'text-green-600'
    },
    {
      title: 'Skipped',
      value: skippedCount,
      change: '-3%',
      icon: UserX,
      color: 'yellow',
      bgGradient: 'from-yellow-500/10 to-yellow-600/10',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Total Campaigns',
      value: totalLogs,
      change: '+24%',
      icon: FileText,
      color: 'purple',
      bgGradient: 'from-purple-500/10 to-purple-600/10',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Monitor member engagement and campaign performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title} 
              className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300 border-2 shadow-md bg-white/90 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg bg-gradient-to-br ${stat.bgGradient} p-2`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={stat.color === 'green' ? 'success' : 'secondary'} className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-slate-500">from last month</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Activity className="h-5 w-5" />
              Run Simulation
            </CardTitle>
            <CardDescription>
              Identify members who need follow-up based on attendance patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Detection logic active</span>
            </div>
            <Button 
              onClick={onRunSimulation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Send className="h-5 w-5" />
              AWS Messaging
            </CardTitle>
            <CardDescription>
              Send follow-up messages via Amazon SNS (SMS) or SES (Email)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span>AWS services connected</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => onSendViaAWS('email')}
                disabled={loading}
                variant="outline"
                className="border-purple-200 hover:bg-purple-50"
              >
                Email
              </Button>
              <Button 
                onClick={() => onSendViaAWS('sms')}
                disabled={loading}
                variant="outline"
                className="border-purple-200 hover:bg-purple-50"
              >
                SMS
              </Button>
            </div>
            <Button 
              onClick={() => onSendViaAWS('both')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Both
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 shadow-md">
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Real-time member activity tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">Response Rate</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">68%</div>
                <Badge variant="success">+5%</Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">Avg. Days Inactive</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">14.2</div>
                <Badge variant="warning">-2 days</Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[50%] rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">Return Rate</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">42%</div>
                <Badge variant="success">+12%</Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
