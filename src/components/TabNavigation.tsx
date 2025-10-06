interface TabNavigationProps {
  activeTab: 'eligible' | 'skipped' | 'logs';
  setActiveTab: (tab: 'eligible' | 'skipped' | 'logs') => void;
}

function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: 'eligible' as const, label: 'Eligible Members', icon: '' },
    { id: 'skipped' as const, label: 'Skipped Members', icon: '' },
    { id: 'logs' as const, label: 'Message Log', icon: '' }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TabNavigation
