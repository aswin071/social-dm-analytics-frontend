import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsAPI, platformAPI, catalogAPI } from '../api/client'
import { CheckCircle, Circle, Upload, Link as LinkIcon, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Onboarding() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchStatus = async () => {
    try {
      const { data } = await analyticsAPI.onboardingStatus()
      setStatus(data)
      if (data.setup_complete) {
        toast.success('Setup complete! Redirecting to dashboard...')
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch {
      toast.error('Failed to load onboarding status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStatus() }, [])

  const handleConnect = async (platform) => {
    try {
      const { data } = await platformAPI.connectUrl(platform)
      window.location.href = data.auth_url
    } catch (err) {
      toast.error(err.response?.data?.error || `Cannot connect ${platform}`)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { data } = await catalogAPI.upload(file)
      toast.success(`Imported ${data.imported} products`)
      fetchStatus()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    }
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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  const steps = [
    {
      title: 'Connect Social Platforms',
      description: 'Link your Instagram, Facebook, Twitter, or WhatsApp Business accounts',
      done: status?.has_connected_platforms,
      content: (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {['instagram', 'facebook', 'twitter'].map((p) => (
            <button key={p} onClick={() => handleConnect(p)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                status?.connected_platforms?.includes(p)
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-dark-300 hover:border-primary-400 hover:bg-primary-50'
              }`}>
              <LinkIcon className="h-4 w-4" />
              <span className="capitalize font-medium">{p}</span>
              {status?.connected_platforms?.includes(p) && <CheckCircle className="h-4 w-4 ml-auto" />}
            </button>
          ))}
          <button onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dark-300 hover:border-green-400 hover:bg-green-50">
            <LinkIcon className="h-4 w-4" />
            <span className="font-medium">WhatsApp</span>
          </button>
        </div>
      ),
    },
    {
      title: 'Upload Product Catalog',
      description: 'Upload your product list so we can match DMs to products',
      done: status?.has_products,
      content: (
        <div className="mt-4 space-y-3">
          <button onClick={handleDownloadTemplate} className="btn-secondary text-sm">
            Download CSV Template
          </button>
          <label className="block">
            <span className="btn-primary text-sm cursor-pointer inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
            </span>
          </label>
          {status?.has_products && (
            <p className="text-sm text-emerald-600">{status.product_count} products loaded</p>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome! Let's get you set up</h1>
      <p className="text-dark-500 mb-8">Complete these steps to start analyzing your DMs</p>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="card">
            <div className="flex items-start gap-4">
              {step.done
                ? <CheckCircle className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                : <Circle className="h-6 w-6 text-dark-300 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-dark-500">{step.description}</p>
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {status?.setup_complete && (
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-8 flex items-center gap-2">
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
