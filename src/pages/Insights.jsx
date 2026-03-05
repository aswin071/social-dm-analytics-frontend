import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api/client'
import { Lightbulb, Download, Clock, Tag, Package } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import toast from 'react-hot-toast'

export default function Insights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data: d } = await analyticsAPI.insights(days)
        setData(d)
      } catch {
        toast.error('Failed to load insights')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [days])

  const handleExport = async () => {
    try {
      const { data: blob } = await analyticsAPI.exportReport(days)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dm_report_${days}d.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!data) return null

  const hourData = {
    labels: data.peak_hours.map((h) => `${h.hour}:00`),
    datasets: [{
      label: 'DMs per hour',
      data: data.peak_hours.map((h) => h.count),
      backgroundColor: 'rgba(59,130,246,0.6)',
      borderRadius: 4,
    }],
  }

  const iconMap = { category: Tag, timing: Clock, product: Package }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-dark-500 text-sm">AI-free intelligence from your DM data</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field w-auto text-sm">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Text Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {data.insights.length > 0 ? data.insights.map((insight, i) => {
          const InsightIcon = iconMap[insight.type] || Lightbulb
          return (
            <div key={i} className="card flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <InsightIcon className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-dark-700">{insight.message}</p>
            </div>
          )
        }) : (
          <div className="card col-span-2 text-center py-8 text-dark-400">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-dark-300" />
            No insights yet. Sync more DMs to generate insights.
          </div>
        )}
      </div>

      {/* Peak Hours Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">DM Volume by Hour</h3>
          {data.peak_hours.length > 0
            ? <Bar data={hourData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            : <p className="text-dark-400 text-sm text-center py-8">No data yet</p>}
        </div>

        {/* Top Products Table */}
        <div className="card">
          <h3 className="font-semibold mb-4">Most Queried Products</h3>
          {data.top_products.length > 0 ? (
            <div className="space-y-2">
              {data.top_products.map((product, i) => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded hover:bg-dark-50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-dark-400 w-6">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-dark-400">{product.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary-600">{product.mention_count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-dark-400 text-sm text-center py-8">No product data</p>}
        </div>
      </div>
    </div>
  )
}
