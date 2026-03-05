import { useState, useEffect } from 'react'
import { messageAPI, productAPI } from '../api/client'
import CategoryBadge from '../components/CategoryBadge'
import PlatformIcon from '../components/PlatformIcon'
import { Search, Filter, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DMExplorer() {
  const [messages, setMessages] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState([])
  const [filters, setFilters] = useState({
    search: '', category: '', platform: '', product: '', resolved: '', date_from: '', date_to: '',
  })

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const { data } = await messageAPI.list(params)
      setMessages(data.results || [])
      setTotalPages(Math.ceil((data.count || 0) / 25))
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    productAPI.list({ page_size: 100 }).then(({ data }) => setProducts(data.results || []))
  }, [])

  useEffect(() => { fetchMessages() }, [page, filters])

  const handleToggleResolved = async (id) => {
    try {
      const { data } = await messageAPI.toggleResolved(id)
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_resolved: data.is_resolved } : m))
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleBulkResolve = async () => {
    if (selected.length === 0) return
    try {
      await messageAPI.bulkResolve(selected)
      toast.success(`Resolved ${selected.length} messages`)
      setSelected([])
      fetchMessages()
    } catch {
      toast.error('Bulk resolve failed')
    }
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">DM Explorer</h1>
          <p className="text-dark-500 text-sm">Search, filter, and manage all your DMs</p>
        </div>
        {selected.length > 0 && (
          <button onClick={handleBulkResolve} className="btn-success text-sm">
            Resolve {selected.length} selected
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-dark-400" />
          <span className="text-sm font-medium text-dark-600">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-400" />
              <input type="text" placeholder="Search messages..." className="input-field pl-9 text-sm"
                value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} />
            </div>
          </div>
          <select className="input-field text-sm" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            <option value="pricing">Pricing</option>
            <option value="stock">Stock</option>
            <option value="complaint">Complaint</option>
            <option value="compliment">Compliment</option>
            <option value="purchase_intent">Purchase Intent</option>
            <option value="general">General</option>
          </select>
          <select className="input-field text-sm" value={filters.platform} onChange={(e) => updateFilter('platform', e.target.value)}>
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <select className="input-field text-sm" value={filters.product} onChange={(e) => updateFilter('product', e.target.value)}>
            <option value="">All Products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input-field text-sm" value={filters.resolved} onChange={(e) => updateFilter('resolved', e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Resolved</option>
            <option value="false">Unresolved</option>
          </select>
          <input type="date" className="input-field text-sm" value={filters.date_from} onChange={(e) => updateFilter('date_from', e.target.value)} />
        </div>
      </div>

      {/* Message Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-dark-400">No messages found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox"
                    checked={selected.length === messages.length && messages.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? messages.map((m) => m.id) : [])}
                    className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Sender</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(msg.id)}
                      onChange={(e) => setSelected(e.target.checked ? [...selected, msg.id] : selected.filter((s) => s !== msg.id))}
                      className="rounded" />
                  </td>
                  <td className="px-4 py-3"><PlatformIcon platform={msg.platform_type} showLabel /></td>
                  <td className="px-4 py-3 text-sm font-medium">{msg.sender_name || msg.sender_id}</td>
                  <td className="px-4 py-3 text-sm text-dark-600 max-w-xs truncate">{msg.message_text}</td>
                  <td className="px-4 py-3">
                    {msg.classification && <CategoryBadge category={msg.classification.category} />}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {msg.classification?.matched_products?.map((p) => (
                      <span key={p.id} className="badge bg-dark-100 text-dark-600 mr-1">{p.name}</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-400 whitespace-nowrap">
                    {new Date(msg.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleResolved(msg.id)} className="transition-colors">
                      {msg.is_resolved
                        ? <CheckCircle className="h-5 w-5 text-emerald-500" />
                        : <Circle className="h-5 w-5 text-dark-300 hover:text-emerald-400" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 bg-dark-50">
            <p className="text-sm text-dark-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary text-sm flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="btn-secondary text-sm flex items-center gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
