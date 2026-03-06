export type Sign = {
  id: string
  user_id: string
  image_url: string | null
  ocr_text: string
  interpretation: string
  temple_name: string | null
  created_at: string
}

export type SignInput = Omit<Sign, 'id' | 'user_id' | 'created_at'>
