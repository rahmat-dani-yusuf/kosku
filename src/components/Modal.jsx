export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-emerald-800">{title}</h2>
          <button onClick={onClose} className="text-emerald-400 hover:text-emerald-700 text-2xl leading-none" aria-label="Tutup">×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
