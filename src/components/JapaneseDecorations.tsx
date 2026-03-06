// 日式装饰组件

export function ToriiGate() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      className="text-red-600"
    >
      {/* 主柱 */}
      <rect x="20" y="10" width="6" height="70" fill="currentColor" />
      <rect x="94" y="10" width="6" height="70" fill="currentColor" />
      {/* 上横梁 */}
      <rect x="10" y="10" width="100" height="6" fill="currentColor" />
      <rect x="14" y="4" width="92" height="4" fill="currentColor" />
      {/* 下横梁 */}
      <rect x="18" y="22" width="84" height="3" fill="currentColor" />
    </svg>
  )
}

export function PineTree() {
  return (
    <svg
      width="40"
      height="60"
      viewBox="0 0 40 60"
      className="text-green-700"
    >
      {/* 树干 */}
      <rect x="18" y="35" width="4" height="25" fill="currentColor" />
      {/* 树冠 */}
      <polygon points="20,5 5,35 35,35" fill="currentColor" opacity="0.9" />
      <polygon points="20,15 10,35 30,35" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function WavePattern() {
  return (
    <svg
      width="200"
      height="12"
      viewBox="0 0 200 12"
      className="text-blue-600"
    >
      <path
        d="M0,8 Q25,0 50,8 Q75,0 100,8 Q125,0 150,8 Q175,0 200,8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export function SeigaihaIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="fill-current"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.75.45l2.27-2.27-1.41-1.41-2.27 2.27C5.21 13.21 5 14.61 5 16c0 3.31 2.69 6 6 6 .55 0 1.05-.11 1.53-.31l2.27 2.27 1.41-1.41-2.27-2.27C18.79 13.21 19 11.81 19 10.5c0-4.08-3.05-7.44-7-7.93z" />
    </svg>
  )
}
