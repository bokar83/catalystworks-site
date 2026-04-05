// components/AuroraBackground.tsx
export default function AuroraBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 20% 10%, rgba(199,125,255,0.45) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 80% 85%, rgba(255,133,161,0.35) 0%, transparent 65%),
          radial-gradient(ellipse 40% 60% at 60% 30%, rgba(224,170,255,0.25) 0%, transparent 65%),
          #12102a
        `,
      }}
    />
  )
}
