// 日式装饰组件

export function ToriiGate() {
  return (
    <img
      src="/torii.png"
      alt="鸟居"
      width="120"
      height="auto"
      className="drop-shadow-lg"
    />
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
