/** Separador horizontal con texto centrado (ej. "O"). */
export default function Divider({ label }: { label: string }) {
  return (
    <div className="relative text-center" role="separator">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-surface-container-high" />
      </div>
      <span className="relative bg-surface-container-lowest px-2 text-label-mono text-outline">
        {label}
      </span>
    </div>
  )
}
