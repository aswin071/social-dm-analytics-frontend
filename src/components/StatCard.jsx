export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', alert }) {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className={`card ${alert ? 'ring-2 ring-red-400' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm text-dark-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}
