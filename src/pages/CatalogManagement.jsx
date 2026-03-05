import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, catalogAPI } from '../api/client'
import { Upload, Download, Plus, Pencil, Trash2, Package, Search, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CatalogManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ sku: '', name: '', category: '', price: '', keywords: '' })

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.list({ search, page_size: 100 })
      setProducts(data.results || [])
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [search])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { data } = await catalogAPI.upload(file)
      toast.success(`Imported ${data.imported} products${data.failed ? `, ${data.failed} failed` : ''}`)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    }
    e.target.value = ''
  }

  const handleDownloadTemplate = async () => {
    try {
      const { data } = await catalogAPI.downloadTemplate()
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'product_catalog_template.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download template')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, price: form.price ? parseFloat(form.price) : null }
      if (editing) {
        await productAPI.update(editing, payload)
        toast.success('Product updated')
      } else {
        await productAPI.create(payload)
        toast.success('Product added')
      }
      setShowForm(false)
      setEditing(null)
      setForm({ sku: '', name: '', category: '', price: '', keywords: '' })
      fetchProducts()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : 'Save failed')
    }
  }

  const handleEdit = (product) => {
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category || '',
      price: product.price || '',
      keywords: product.keywords || '',
    })
    setEditing(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productAPI.delete(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch {
      toast.error('Delete failed')
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-dark-500 text-sm">{products.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadTemplate} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> Template
          </button>
          <label className="btn-secondary text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="h-4 w-4" /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </label>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ sku: '', name: '', category: '', price: '', keywords: '' }) }}
            className="btn-primary text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input type="text" placeholder="SKU" className="input-field text-sm" value={form.sku} onChange={update('sku')} required />
            <input type="text" placeholder="Product Name" className="input-field text-sm" value={form.name} onChange={update('name')} required />
            <input type="text" placeholder="Category" className="input-field text-sm" value={form.category} onChange={update('category')} />
            <input type="number" placeholder="Price" className="input-field text-sm" value={form.price} onChange={update('price')} step="0.01" />
            <input type="text" placeholder="Keywords (comma-separated)" className="input-field text-sm col-span-2" value={form.keywords} onChange={update('keywords')} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-400" />
        <input type="text" placeholder="Search products..." className="input-field pl-9 text-sm"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-3 text-dark-300" />
          <p className="text-dark-500">No products yet. Upload a CSV or add products manually.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-dark-400">{product.sku} &middot; {product.category}</p>
                </div>
                {product.price && <span className="text-lg font-bold text-primary-600">₹{product.price}</span>}
              </div>
              {product.keywords && (
                <p className="text-xs text-dark-400 mb-3">Keywords: {product.keywords}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                <Link to={`/products/${product.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> Analytics
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="text-dark-400 hover:text-dark-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-dark-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
