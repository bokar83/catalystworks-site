// components/InstallPrompt.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isStandalone = ('standalone' in navigator) && (navigator as Navigator & { standalone?: boolean }).standalone
    const dismissed = localStorage.getItem('attire-inspo-install-dismissed')
    if (isIOS && !isStandalone && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem('attire-inspo-install-dismissed', '1')
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-[100] rounded-2xl p-4 border border-white/20"
          style={{ background: 'rgba(30,15,50,0.95)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✨</span>
            <div className="flex-1">
              <p className="font-syne font-bold text-sm text-white mb-1">Install Attire Inspo</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Tap <strong style={{ color: '#c77dff' }}>Share</strong> then <strong style={{ color: '#c77dff' }}>Add to Home Screen</strong> to install the app on your phone.
              </p>
            </div>
            <button onClick={dismiss} className="text-xl leading-none flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>×</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
