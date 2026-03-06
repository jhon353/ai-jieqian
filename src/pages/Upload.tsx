import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Camera, X, Clock } from 'lucide-react'
import { interpretSign } from '../services/ai'
import { uploadImage, saveSign } from '../services/storage'
import { ToriiGate } from '../components/JapaneseDecorations'
import { useRateLimit } from '../hooks/useRateLimit'

export function Upload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [templeName, setTempleName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const {
    canMakeRequest,
    recordRequest,
    getRemainingCount,
    getNextResetTime,
    showLimitReached,
    DAILY_LIMIT,
  } = useRateLimit()

  const [remainingCount, setRemainingCount] = useState(DAILY_LIMIT)

  useEffect(() => {
    setRemainingCount(getRemainingCount())
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过 10MB')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCapture = () => {
    if (!canMakeRequest()) {
      showLimitReached()
      return
    }
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (!preview || !user) return

    if (!canMakeRequest()) {
      showLimitReached()
      return
    }

    setLoading(true)

    try {
      recordRequest()
      setRemainingCount(remainingCount - 1)

      let imageUrl: string | null = null

      // 1. 上传图片到 Supabase Storage
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, user.id)
      }

      // 2. 调用智谱 API 识别文字并解读签文
      const { ocrText, interpretation } = await interpretSign(preview, templeName || undefined)

      if (!interpretation || interpretation.trim().length === 0) {
        throw new Error('解读失败，请确保图片清晰')
      }

      // 3. 保存到数据库
      const signId = await saveSign(user.id, imageUrl, ocrText || '未识别到文字', interpretation, templeName || null)

      // 跳转到结果页
      navigate(`/result/${signId}`)
    } catch (error: any) {
      console.error('Error:', error)
      // 如果失败，恢复计数
      setRemainingCount(remainingCount + 1)
      alert(error.message || '处理失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setSelectedFile(null)
    setTempleName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const canRequest = canMakeRequest()

  return (
    <div className="min-h-screen japanese-bg pb-8">
      {/* Header */}
      <header className="backdrop-blur-sm shadow-sm">
        <div className="max-w-sm mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ToriiGate />
            <h1 className="text-xl font-bold text-gray-900">御签</h1>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            退出
          </button>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 py-6">
        {/* 次数限制提示 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="text-sm">
                今日剩余次数：<span className="font-bold text-red-600">{remainingCount}</span> / {DAILY_LIMIT}
              </span>
            </div>
            <span className="text-xs text-gray-500">{getNextResetTime()}</span>
          </div>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={handleCapture}
            className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed p-12 text-center transition active:scale-[0.98] ${
              canRequest ? 'cursor-pointer hover:border-red-400' : 'cursor-not-allowed opacity-60'
            }`}
          >
            <Camera className={`w-16 h-16 mx-auto mb-4 ${canRequest ? 'text-gray-400' : 'text-gray-300'}`} />
            <h2 className="text-lg font-medium text-gray-900 mb-2">上传签纸图片</h2>
            <p className="text-sm text-gray-500">点击拍照或选择图片</p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden washi-paper">
            <div className="relative">
              <img src={preview} alt="签纸" className="w-full" />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Temple Name Input */}
        {preview && (
          <div className="mt-4">
            <label htmlFor="temple" className="block text-sm font-medium text-gray-700 mb-2">
              寺庙名称（可选）
            </label>
            <input
              id="temple"
              type="text"
              value={templeName}
              onChange={(e) => setTempleName(e.target.value)}
              placeholder="例如：浅草寺"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white/50"
            />
          </div>
        )}

        {/* Submit Button */}
        {preview && (
          <button
            onClick={handleSubmit}
            disabled={loading || !canRequest}
            className={`w-full mt-6 py-4 rounded-xl font-medium transition active:scale-[0.98] ${
              canRequest && !loading
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-400 text-white cursor-not-allowed'
            }`}
          >
            {loading ? '解读中...' : canRequest ? '开始解读' : '次数已用完'}
          </button>
        )}

        {/* History Button */}
        <button
          onClick={() => navigate('/history')}
          className="w-full mt-3 bg-white/90 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition active:scale-[0.98]"
        >
          查看历史记录
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
