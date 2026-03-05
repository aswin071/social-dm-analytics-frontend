import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI, syncAPI } from '../api/client'
import StatCard from '../components/StatCard'
import CategoryBadge from '../components/CategoryBadge'
import PlatformIcon from '../components/PlatformIcon'
import { MessageSquare, AlertTriangle, TrendingUp, Package, RefreshCw } from 'lucide-react'
import { Doughnut, Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement)

const CATEGORY_COLORS = {
  pricing: '#3b82f6',
  stock: '#f59e0b',
  complaint: '#ef4444',
  compliment: '#10b981',
  purchase_intent: '#8b5cf6',
  general: '#94a3b8',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [days, setDays] = useState(30)

  const fetchDashboard = async () => {
    try {
      const { data: d } = await analyticsAPI.dashboard(days)
      setData(d)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [days])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const { data: result } = await syncAPI.syncAll()
      toast.success(`Synced ${result.total_synced} new messages`)
      fetchDashboard()
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!data) return null

  const pieData = {
    labels: data.category_breakdown.map((c) => c.category),
    datasets: [{
      data: data.category_breakdown.map((c) => c.count),
      backgroundColor: data.category_breakdown.map((c) => CATEGORY_COLORS[c.category] || '#94a3b8'),
      borderWidth: 0,
    }],
  }

  const lineData = {
    labels: data.daily_volume.map((d) => d.date),
    datasets: [{
      label: 'DMs',
      data: data.daily_volume.map((d) => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.3,
    }],
  }

  const platformData = {
    labels: data.platform_breakdown.map((p) => p.platform),
    datasets: [{
      label: 'Messages',
      data: data.platform_breakdown.map((p) => p.count),
      backgroundColor: ['#ec4899', '#3b82f6', '#06b6d4', '#22c55e'],
    }],
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-dark-500 text-sm">Overview of your social DM analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field w-auto text-sm">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={handleSync} disabled={syncing} className="btn-primary flex items-center gap-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync DMs
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total DMs" value={data.stats.total} subtitle={`${data.stats.today} today`} icon={MessageSquare} color="primary" />
        <StatCard title="This Week" value={data.stats.this_week} icon={TrendingUp} color="green" />
        <StatCard title="This Month" value={data.stats.this_month} icon={Package} color="purple" />
        <StatCard title="Unanswered" value={data.stats.unanswered} icon={AlertTriangle} color="red" alert={data.stats.unanswered > 0} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-4">DM Volume Trend</h3>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: true, grid: { display: false } }, y: { beginAtZero: true } } }} />
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Query Categories</h3>
          {data.category_breakdown.length > 0
            ? <Doughnut data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 12 } } } }} />
            : <p className="text-dark-400 text-sm text-center py-8">No data yet</p>}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <h3 className="font-semibold mb-4">Top Queried Products</h3>
          {data.top_products.length > 0 ? (
            <div className="space-y-3">
              {data.top_products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-50 transition-colors">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-dark-400">{product.category} &middot; {product.sku}</p>
                  </div>
                  <span className="badge bg-primary-100 text-primary-700">{product.mention_count} mentions</span>
                </Link>
              ))}
            </div>
          ) : <p className="text-dark-400 text-sm text-center py-8">Upload your catalog to see product mentions</p>}
        </div>

        {/* Platform Breakdown */}
        <div className="card">
          <h3 className="font-semibold mb-4">Messages by Platform</h3>
          {data.platform_breakdown.length > 0
            ? <Bar data={platformData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            : <p className="text-dark-400 text-sm text-center py-8">Connect platforms to see breakdown</p>}
        </div>
      </div>
    </div>
  )
}
