import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productAPI } from '../api/client'
import CategoryBadge from '../components/CategoryBadge'
import StatCard from '../components/StatCard'
import { ArrowLeft, TrendingUp, MessageSquare, ShoppingCart } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  pricing: '#3b82f6', stock: '#f59e0b', complaint: '#ef4444',
  compliment: '#10b981', purchase_intent: '#8b5cf6', general: '#94a3b8',
}

export default function ProductIntelligence() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, analyticsRes] = await Promise.all([
          productAPI.get(id),
          productAPI.analytics(id, days),
        ])
        setProduct(prodRes.data)
        setAnalytics(analyticsRes.data)
      } catch {
        toast.error('Failed to load product data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, days])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!product || !analytics) return <p className="text-dark-400">Product not found</p>

  const pieData = {
    labels: analytics.category_breakdown.map((c) => c.category),
    datasets: [{
      data: analytics.category_breakdown.map((c) => c.count),
      backgroundColor: analytics.category_breakdown.map((c) => CATEGORY_COLORS[c.category] || '#94a3b8'),
      borderWidth: 0,
    }],
  }

  return (
    <div>
      <Link to="/catalog" className="flex items-center gap-1 text-dark-500 hover:text-dark-700 text-sm mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-dark-500 text-sm">{product.sku} &middot; {product.category} &middot; ₹{product.price}</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field w-auto text-sm">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Mentions" value={analytics.total_mentions} icon={MessageSquare} color="primary" />
        <StatCard title="Purchase Intent Score" value={`${analytics.purchase_intent_score}%`} icon={ShoppingCart} color="purple" />
        <StatCard title="Categories" value={analytics.category_breakdown.length} icon={TrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">Query Breakdown</h3>
          {analytics.category_breakdown.length > 0
            ? <div className="max-w-xs mx-auto"><Doughnut data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} /></div>
            : <p className="text-dark-400 text-center py-8">No queries for this product</p>}
        </div>

        {/* Category Stats */}
        <div className="card">
          <h3 className="font-semibold mb-4">Category Details</h3>
          <div className="space-y-3">
            {analytics.category_breakdown.map((cat) => {
              const pct = analytics.total_mentions ? Math.round(cat.count / analytics.total_mentions * 100) : 0
              return (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={cat.category} />
                    <span className="text-sm text-dark-600">{cat.count} queries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-dark-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat.category] }} />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Mentions</h3>
        {analytics.recent_messages.length > 0 ? (
          <div className="space-y-3">
            {analytics.recent_messages.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-dark-50">
                <CategoryBadge category={item.category} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.message.message_text}</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {item.message.sender_name} &middot; {item.message.platform_name} &middot; {new Date(item.message.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-dark-400 text-sm text-center py-8">No recent mentions</p>}
      </div>
    </div>
  )
}
