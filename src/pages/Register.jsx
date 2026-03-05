import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created!')
      navigate('/onboarding')
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-10 w-10 text-primary-400" />
            <h1 className="text-3xl font-bold text-white">DM Analytics</h1>
          </div>
          <p className="text-dark-400">Create your account</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Username</label>
              <input type="text" className="input-field" value={form.username} onChange={update('username')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Password</label>
              <input type="password" className="input-field" value={form.password} onChange={update('password')} required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Confirm Password</label>
              <input type="password" className="input-field" value={form.confirm} onChange={update('confirm')} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-dark-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
