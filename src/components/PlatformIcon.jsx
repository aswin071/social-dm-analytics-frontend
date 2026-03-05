const PLATFORM_COLORS = {
  instagram: 'text-pink-600',
  facebook: 'text-blue-600',
  twitter: 'text-sky-500',
  whatsapp: 'text-green-600',
}

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  whatsapp: 'WhatsApp',
}

export default function PlatformIcon({ platform, showLabel = false }) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${PLATFORM_COLORS[platform] || 'text-dark-500'}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {showLabel && (PLATFORM_LABELS[platform] || platform)}
    </span>
  )
}

export { PLATFORM_LABELS }
