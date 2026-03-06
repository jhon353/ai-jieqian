interface RateLimitData {
  dailyCount: number
  lastResetDate: string
  lastRequestTime: number
}

const DAILY_LIMIT = 5 // 每天最多 5 次
const RATE_LIMIT_MS = 60000 // 每分钟限制（60秒）

export function useRateLimit() {
  const getTodayKey = () => {
    return `omikuji_daily_${new Date().toDateString()}`
  }

  const getRateLimitData = (): RateLimitData => {
    const key = getTodayKey()
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data)
    }
    return {
      dailyCount: 0,
      lastResetDate: new Date().toDateString(),
      lastRequestTime: 0,
    }
  }

  const setRateLimitData = (data: RateLimitData) => {
    const key = getTodayKey()
    localStorage.setItem(key, JSON.stringify(data))
  }

  const resetIfNeeded = () => {
    const data = getRateLimitData()
    const today = new Date().toDateString()

    if (data.lastResetDate !== today) {
      // 新的一天，重置计数
      setRateLimitData({
        dailyCount: 0,
        lastResetDate: today,
        lastRequestTime: 0,
      })
    }
  }

  const canMakeRequest = (): boolean => {
    resetIfNeeded()

    const data = getRateLimitData()
    const now = Date.now()

    // 检查每日限制
    if (data.dailyCount >= DAILY_LIMIT) {
      return false
    }

    // 检查每分钟限制
    if (data.lastRequestTime && now - data.lastRequestTime < RATE_LIMIT_MS) {
      return false
    }

    return true
  }

  const recordRequest = () => {
    const data = getRateLimitData()
    setRateLimitData({
      ...data,
      dailyCount: data.dailyCount + 1,
      lastRequestTime: Date.now(),
    })
  }

  const getRemainingCount = (): number => {
    resetIfNeeded()
    const data = getRateLimitData()
    return Math.max(0, DAILY_LIMIT - data.dailyCount)
  }

  const getNextResetTime = (): string => {
    resetIfNeeded()
    const data = getRateLimitData()

    // 如果已达到每日限制，返回明天的时间
    if (data.dailyCount >= DAILY_LIMIT) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return `明天 ${tomorrow.getHours()}:00 重置`
    }

    // 如果是每分钟限制，返回剩余时间
    if (data.lastRequestTime) {
      const waitTime = RATE_LIMIT_MS - (Date.now() - data.lastRequestTime)
      if (waitTime > 0) {
        const seconds = Math.ceil(waitTime / 1000)
        return `${seconds}秒后可再试`
      }
    }

    return '可立即使用'
  }

  const showLimitReached = () => {
    const resetTime = getNextResetTime()
    alert(`今日解读次数已达上限（${DAILY_LIMIT}次），${resetTime}`)
  }

  return {
    canMakeRequest,
    recordRequest,
    getRemainingCount,
    getNextResetTime,
    showLimitReached,
    DAILY_LIMIT,
    RATE_LIMIT_MS,
  }
}
