import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ToriiGate } from '../components/JapaneseDecorations'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen japanese-bg flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm">
        {/* 鸟居装饰 */}
        <div className="flex justify-center mb-6">
          <ToriiGate />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 washi-paper">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">御签</h1>
            <p className="text-gray-600">上传签纸图片，智能解读</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            还没有账号？{' '}
            <Link to="/register" className="text-red-600 font-medium hover:text-red-700">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
