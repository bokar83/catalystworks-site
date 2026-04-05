// components/GlassCard.tsx
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function GlassCard({ children, className, style }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 p-4',
        'backdrop-blur-glass',
        className
      )}
      style={{ background: 'rgba(255,255,255,0.12)', ...style }}
    >
      {children}
    </div>
  )
}
