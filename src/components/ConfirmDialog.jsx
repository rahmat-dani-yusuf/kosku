export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-emerald-800 mb-2">{title}</h3>
        <p className="text-sm text-emerald-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50 transition">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition">Ya, Hapus</button>
        </div>
      </div>
    </div>
  )
}
