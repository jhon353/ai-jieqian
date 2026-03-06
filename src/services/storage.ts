import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// 上传图片到 Supabase Storage
export async function uploadImage(
  file: File,
  userId: string
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('signs')
      .upload(fileName, file)

    if (error) throw error

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('signs')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// 保存签文记录到数据库
export async function saveSign(
  userId: string,
  imageUrl: string | null,
  ocrText: string,
  interpretation: string,
  templeName: string | null
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('signs')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        ocr_text: ocrText,
        interpretation: interpretation,
        temple_name: templeName,
      })
      .select()
      .single()

    if (error) throw error

    return data.id
  } catch (error) {
    console.error('Save sign error:', error)
    throw error
  }
}

// 获取用户的所有签文记录
export async function getSigns(userId: string) {
  try {
    const { data, error } = await supabase
      .from('signs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Get signs error:', error)
    throw error
  }
}

// 获取单个签文记录
export async function getSign(signId: string) {
  try {
    const { data, error } = await supabase
      .from('signs')
      .select('*')
      .eq('id', signId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Get sign error:', error)
    throw error
  }
}

// 删除签文记录
export async function deleteSign(signId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('signs')
      .delete()
      .eq('id', signId)

    if (error) throw error
  } catch (error) {
    console.error('Delete sign error:', error)
    throw error
  }
}
