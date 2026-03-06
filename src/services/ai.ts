// AI 解读服务 - 使用智谱视觉 API
export async function interpretSign(
  imageBase64: string,
  templeName?: string
): Promise<{ ocrText: string; interpretation: string }> {
  const apiKey = import.meta.env.VITE_ZHIPU_API_KEY

  if (!apiKey) {
    throw new Error('智谱 API Key 未配置')
  }

  // 移除 base64 前缀
  const base64Data = imageBase64.split(',')[1] || imageBase64

  // 第一步：识别文字
  const ocrPrompt = `请仔细识别这张日本寺庙签纸图片中的所有文字内容，包括：
1. 签的等级（大吉、中吉、小吉等）
2. 签文的具体内容
3. 任何其他可见的文字

请只输出识别出的文字，不要做任何解读或解释。`

  try {
    const ocrResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4v',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ocrPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Data,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    })

    const ocrResult = await ocrResponse.json()

    if (ocrResult.error) {
      throw new Error(`智谱 OCR 错误: ${ocrResult.error.message}`)
    }

    const ocrText = ocrResult.choices[0].message.content

    // 第二步：解读签文
    const interpretPrompt = `你是一位精通日本文化和佛教签文（おみくじ）的解读专家。

${templeName ? `寺庙名称：${templeName}` : ''}
签文内容：
${ocrText}

请按以下格式解读：

## 运势等级
（大吉、中吉、小吉、吉、末吉、凶、大凶等）

## 总体运势
用一段话描述整体运势。

## 具体建议
针对签文内容，给出 3-5 条具体的建议，包括：
- 事业/学业
- 感情
- 健康
- 财运
- 其他相关方面

## 特别提醒
需要特别注意的事项

请用温和、鼓励的语气进行解读，让用户感受到积极的能量。解读内容要准确、实用，具有参考价值。`

    const interpretResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content: interpretPrompt,
          },
        ],
        max_tokens: 2000,
      }),
    })

    const interpretResult = await interpretResponse.json()

    if (interpretResult.error) {
      throw new Error(`智谱解读错误: ${interpretResult.error.message}`)
    }

    const interpretation = interpretResult.choices[0].message.content

    return {
      ocrText,
      interpretation,
    }
  } catch (error) {
    console.error('AI interpretation error:', error)
    throw error
  }
}
