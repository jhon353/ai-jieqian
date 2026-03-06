import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Sign } from '../types/supabase'
import { ArrowLeft, Plus } from 'lucide-react'

export function History() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [signs, setSigns] = useState<Sign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSigns()
    }
  }, [user])

  const loadSigns = async () => {
    try {
      const { data, error } = await supabase
        .from('signs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSigns(data || [])
    } catch (error) {
      console.error('Error loading signs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSummary = (text: string) => {
    return text.substring(0, 50) + (text.length > 50 ? '...' : '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
          <h1 className="text-lg font-bold text-gray-900">历史记录</h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {signs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有签文记录</h3>
              <p className="text-gray-500 mb-4">上传第一张签纸图片开始吧</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                上传签纸
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {signs.map((sign) => (
              <div
                key={sign.id}
                onClick={() => navigate(`/result/${sign.id}`)}
                className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition active:scale-[0.98]"
              >
                <div className="flex gap-4">
                  {sign.image_url && (
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={sign.image_url}
                        alt="签纸"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {sign.temple_name && (
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        {sign.temple_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(sign.created_at)}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {getSummary(sign.interpretation)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
