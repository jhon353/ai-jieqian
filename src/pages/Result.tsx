import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Sign } from '../types/supabase'
import { ArrowLeft, Share2, Trash2 } from 'lucide-react'
import { ToriiGate, PineTree } from '../components/JapaneseDecorations'

export function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sign, setSign] = useState<Sign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && id !== 'temp') {
      loadSign(id)
    }
  }, [id])

  const loadSign = async (signId: string) => {
    try {
      const { data, error } = await supabase
        .from('signs')
        .select('*')
        .eq('id', signId)
        .single()

      if (error) throw error
      setSign(data)
    } catch (error) {
      console.error('Error loading sign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!sign || !confirm('确定要删除这条记录吗？')) return

    try {
      const { error } = await supabase
        .from('signs')
        .delete()
        .eq('id', sign.id)

      if (error) throw error
      navigate('/history')
    } catch (error) {
      console.error('Error deleting sign:', error)
      alert('删除失败，请重试')
    }
  }

  const handleShare = async () => {
    if (navigator.share && sign) {
      try {
        await navigator.share({
          title: '御签结果',
          text: `我在 ${sign.temple_name || '某寺庙'} 抽到了签，智能解读如下：${sign.interpretation.substring(0, 100)}...`,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen japanese-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // 临时显示（开发用）
  if (id === 'temp') {
    return (
      <div className="min-h-screen japanese-bg">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </button>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-6">
          {/* 松树装饰 */}
          <div className="flex justify-center mb-4">
            <PineTree />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 washi-paper">
            <h2 className="text-xl font-bold text-gray-900 mb-4">签文内容</h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
              大吉
              願望成就，凡事順利，可以進行，
              此時最利，勿要疑心，必定成功。
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">智能解读</h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              恭喜你抽到了"大吉"签！这是最好的签文之一，预示着你所期盼的事情将会实现。

              总体运势：
              这是一个非常吉祥的时刻，你之前的努力即将得到回报。无论是事业、感情还是健康方面，都有很好的发展机会。

              建议：
              - 保持积极乐观的心态
              - 勇敢地采取行动，不要犹豫
              - 相信自己的判断力和能力
              - 把握好现在的机遇

              特别提醒：
              此时是推进计划的最佳时机，不要因为疑虑而错过良机。但同时也要保持脚踏实地，好运与努力相结合才能获得最好的结果。
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleShare}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition active:scale-[0.98]"
            >
              <Share2 className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen japanese-bg">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
          <div className="flex items-center gap-2">
            <ToriiGate />
            <h1 className="text-lg font-bold text-gray-900">御签</h1>
          </div>
          {sign && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 松树装饰 */}
        <div className="flex justify-center mb-4">
          <PineTree />
        </div>

        {sign ? (
          <>
            {sign.image_url && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-4">
                <img src={sign.image_url} alt="签纸" className="w-full" />
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 washi-paper">
              {sign.temple_name && (
                <p className="text-sm text-red-600 font-medium mb-4">{sign.temple_name}</p>
              )}

              <h2 className="text-xl font-bold text-gray-900 mb-4">签文内容</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                {sign.ocr_text}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">智能解读</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {sign.interpretation}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleShare}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition active:scale-[0.98]"
              >
                <Share2 className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">未找到签文记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
