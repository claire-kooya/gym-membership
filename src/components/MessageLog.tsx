import { LogEntry } from '../types'

interface MessageLogProps {
  logs: LogEntry[];
}

function MessageLog({ logs }: MessageLogProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Logs Yet</h3>
        <p className="text-gray-500">Run a simulation to generate message logs.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Simulation History ({logs.length})
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Record of all simulation runs with timestamps
        </p>
      </div>

      <div className="space-y-4">
        {logs.slice().reverse().map((log, index) => (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-lg p-6 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {new Date(log.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-xs text-green-600 font-medium mb-1">Eligible</div>
                    <div className="text-2xl font-bold text-green-700">
                      {log.eligible_count}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Skipped</div>
                    <div className="text-2xl font-bold text-yellow-700">
                      {log.skipped_count}
                    </div>
                  </div>
                </div>

                {log.eligible_members.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Eligible Members:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {log.eligible_members.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {log.skipped_members.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Skipped Members:
                    </div>
                    <div className="space-y-1">
                      {log.skipped_members.map((member) => (
                        <div
                          key={member.id}
                          className="text-xs bg-gray-50 p-2 rounded border border-gray-200"
                        >
                          <span className="font-medium">{member.name}</span>
                          <span className="text-gray-500"> - {member.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageLog
