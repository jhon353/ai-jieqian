// 日式装饰组件

export function ToriiGate() {
  return (
    <img
      src="/torii.png"
      alt="鸟居"
      width="60"
      height="auto"
      className="drop-shadow-lg"
    />
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
