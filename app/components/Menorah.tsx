export function Menorah({ size = 40, className = '' }: { size?: number; className?: string }) {
  const s = size / 100
  const gold = '#C9A84C'
  const goldLight = '#E8C97A'

  // Arm bezier points helper
  const arm = (ex: number, ey: number) => {
    const cx = 50, cy = 80
    const pts: [number, number][] = []
    for (let t = 0; t <= 20; t++) {
      const tn = t / 20
      const bx = (1-tn)**2*cx + 2*(1-tn)*tn*ex + tn**2*ex
      const by = (1-tn)**2*cy + 2*(1-tn)*tn*cy + tn**2*ey
      pts.push([bx, by])
    }
    return pts.map((p,i) => i===0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`).join(' ')
  }

  const flames = [
    { x: 5,  y: 55, scale: 0.78 },
    { x: 20, y: 58, scale: 0.84 },
    { x: 35, y: 61, scale: 0.90 },
    { x: 50, y: 57, scale: 1.00 },
    { x: 65, y: 61, scale: 0.90 },
    { x: 80, y: 58, scale: 0.84 },
    { x: 95, y: 55, scale: 0.78 },
  ]

  return (
    <svg
      width={size} height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Base */}
      <rect x="35" y="112" width="30" height="5" rx="2.5" fill={gold}/>
      <rect x="42" y="107" width="16" height="7" rx="2" fill={gold}/>
      {/* Central stem */}
      <rect x="47.5" y="59" width="5" height="50" rx="2.5" fill={gold}/>
      {/* 6 arms */}
      {[[5,55],[20,58],[35,61],[65,61],[80,58],[95,55]].map(([ex,ey], i) => (
        <path key={i} d={arm(ex, ey)} stroke={gold} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      ))}
      {/* 7 Flames */}
      {flames.map((f, i) => {
        const fw = 5 * f.scale
        const fh = 13 * f.scale
        const iw = fw * 0.5
        const ih = fh * 0.55
        return (
          <g key={i}>
            {/* Outer flame */}
            <ellipse cx={f.x} cy={f.y - fh/2} rx={fw} ry={fh/2} fill={gold}/>
            {/* Inner glow */}
            <ellipse cx={f.x} cy={f.y - fh/2 - ih*0.1} rx={iw} ry={ih/2} fill={goldLight} opacity="0.75"/>
          </g>
        )
      })}
    </svg>
  )
}
