import { useState, useEffect } from 'react'
import { platformAPI } from '../api/client'
import PlatformIcon, { PLATFORM_LABELS } from '../components/PlatformIcon'
import { Link as LinkIcon, Unlink, RefreshCw, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [platforms, setPlatforms] = useState([])
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(true)
  const [waForm, setWaForm] = useState({ phone_number_id: '', access_token: '' })
  const [showWaForm, setShowWaForm] = useState(false)

  const fetchPlatforms = async () => {
    try {
      const [listRes, availRes] = await Promise.all([
        platformAPI.list(),
        platformAPI.available(),
      ])
      setPlatforms(listRes.data.results || listRes.data)
      setAvailable(availRes.data)
    } catch {
      toast.error('Failed to load platforms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlatforms() }, [])

  const handleConnect = async (platform) => {
    if (platform === 'whatsapp') {
      setShowWaForm(true)
      return
    }
    try {
      const { data } = await platformAPI.connectUrl(platform)
      window.location.href = data.auth_url
    } catch (err) {
      toast.error(err.response?.data?.error || `Cannot connect ${platform}`)
    }
  }

  const handleDisconnect = async (id) => {
    if (!confirm('Disconnect this platform?')) return
    try {
      await platformAPI.disconnect(id)
      toast.success('Platform disconnected')
      fetchPlatforms()
    } catch {
      toast.error('Disconnect failed')
    }
  }

  const handleReconnect = async (id) => {
    try {
      await platformAPI.reconnect(id)
      toast.success('Platform reconnected')
      fetchPlatforms()
    } catch {
      toast.error('Reconnect failed')
    }
  }

  const handleWhatsAppSetup = async (e) => {
    e.preventDefault()
    try {
      await platformAPI.setupWhatsApp(waForm)
      toast.success('WhatsApp connected!')
      setShowWaForm(false)
      setWaForm({ phone_number_id: '', access_token: '' })
      fetchPlatforms()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Setup failed')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  const connectedPlatforms = platforms.filter((p) => p.is_active)
  const disconnectedPlatforms = platforms.filter((p) => !p.is_active)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-dark-500 text-sm mb-8">Manage your social platform connections</p>

      {/* Connected Platforms */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Wifi className="h-5 w-5 text-emerald-500" /> Connected Platforms
        </h2>
        {connectedPlatforms.length === 0 ? (
          <p className="text-dark-400 text-sm">No platforms connected yet.</p>
        ) : (
          <div className="space-y-3">
            {connectedPlatforms.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-dark-200 bg-dark-50">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={p.platform} showLabel />
                  <div>
                    <p className="text-sm font-medium">{p.username || p.platform_user_id}</p>
                    <p className="text-xs text-dark-400">
                      Connected {new Date(p.connected_at).toLocaleDateString()}
                      {p.last_synced && ` · Last synced ${new Date(p.last_synced).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_token_expired && (
                    <span className="badge bg-red-100 text-red-700 text-xs">Token Expired</span>
                  )}
                  <button onClick={() => handleDisconnect(p.id)} className="btn-secondary text-xs flex items-center gap-1">
                    <Unlink className="h-3 w-3" /> Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available to Connect */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary-500" /> Connect New Platform
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {available.filter((p) => !p.connected).map((p) => (
            <button key={p.key} onClick={() => handleConnect(p.key)}
              className="flex items-center gap-3 p-4 rounded-lg border border-dark-200 hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <PlatformIcon platform={p.key} />
              <span className="font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Manual Setup */}
      {showWaForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">WhatsApp Business Setup</h2>
          <p className="text-sm text-dark-500 mb-4">
            Enter your WhatsApp Business API credentials from Meta Business Manager.
          </p>
          <form onSubmit={handleWhatsAppSetup} className="space-y-3">
            <input type="text" placeholder="Phone Number ID" className="input-field text-sm"
              value={waForm.phone_number_id} onChange={(e) => setWaForm({ ...waForm, phone_number_id: e.target.value })} required />
            <input type="text" placeholder="Access Token" className="input-field text-sm"
              value={waForm.access_token} onChange={(e) => setWaForm({ ...waForm, access_token: e.target.value })} required />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">Connect WhatsApp</button>
              <button type="button" onClick={() => setShowWaForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Disconnected Platforms */}
      {disconnectedPlatforms.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4 text-dark-500">Previously Connected</h2>
          <div className="space-y-3">
            {disconnectedPlatforms.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-dark-200">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={p.platform} showLabel />
                  <span className="text-sm text-dark-400">{p.username}</span>
                </div>
                <button onClick={() => handleReconnect(p.id)} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Reconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
