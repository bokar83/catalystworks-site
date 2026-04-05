// components/ResultBox.tsx

interface ResultBoxProps {
  content: string
  loading: boolean
}

export default function ResultBox({ content, loading }: ResultBoxProps) {
  if (loading) {
    return (
      <div className="p-5 rounded-2xl backdrop-blur-glass bg-white/[0.10] border border-white/20 flex flex-col items-center justify-center gap-4 py-10">
        <div className="w-10 h-10 rounded-full border-2 border-[#c77dff] border-t-transparent animate-spin" />
        <p className="text-sm text-[#f5f0ff]/70 animate-pulse font-inter">
          Your AI stylist is working her magic…
        </p>
      </div>
    )
  }

  if (!content) return null

  const paragraphs = content.split('\n\n').filter(Boolean)

  return (
    <div className="p-5 rounded-2xl backdrop-blur-glass bg-white/[0.10] border border-white/20">
      <h3 className="text-base font-semibold font-syne text-[#c77dff] mb-4">
        ✨ Your Outfit Ideas
      </h3>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-sm text-[#f5f0ff] whitespace-pre-wrap leading-relaxed font-inter"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}
