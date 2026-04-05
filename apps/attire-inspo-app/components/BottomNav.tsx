// components/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const TABS = [
  { href: '/',        icon: '🏠', label: 'Home'   },
  { href: '/closet',  icon: '👗', label: 'Closet'  },
  { href: '/ideas',   icon: '✨', label: 'Ideas'   },
  { href: '/rate',    icon: '🪞', label: 'Rate'    },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center border-t border-white/20"
      style={{
        background: 'rgba(18,16,42,0.90)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        paddingTop: '10px',
      }}
    >
      {TABS.map(tab => {
        const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors"
          >
            <motion.span
              className="text-[1.3rem] leading-none"
              animate={{
                scale: isActive ? 1.15 : 1,
                filter: isActive ? 'drop-shadow(0 0 6px #c77dff)' : 'none',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {tab.icon}
            </motion.span>
            <span
              className="text-[0.65rem] font-medium tracking-wide transition-colors"
              style={{ color: isActive ? '#c77dff' : 'rgba(245,240,255,0.65)' }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
