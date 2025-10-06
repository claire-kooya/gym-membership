interface StatsCardsProps {
  totalMembers: number;
  eligibleCount: number;
  skippedCount: number;
  totalLogs: number;
}

function StatsCards({ totalMembers, eligibleCount, skippedCount, totalLogs }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Members',
      value: totalMembers,
      icon: '',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Eligible to Message',
      value: eligibleCount,
      icon: '',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      label: 'Skipped',
      value: skippedCount,
      icon: '',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      label: 'Total Simulations',
      value: totalLogs,
      icon: '',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-lg border-2 p-6 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
