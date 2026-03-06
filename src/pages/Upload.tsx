import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Camera, X } from 'lucide-react'
import { interpretSign } from '../services/ai'
import { uploadImage, saveSign } from '../services/storage'
import { ToriiGate } from '../components/JapaneseDecorations'

export function Upload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [templeName, setTempleName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

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
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (!preview || !user) return

    setLoading(true)

    try {
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
        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={handleCapture}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed p-12 text-center cursor-pointer hover:border-red-400 transition active:scale-[0.98]"
          >
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
            disabled={loading}
            className="w-full mt-6 bg-red-600 text-white py-4 rounded-xl font-medium hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? '解读中...' : '开始解读'}
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
