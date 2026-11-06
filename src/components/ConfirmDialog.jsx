export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Ya, Hapus', confirmClass = 'bg-red-500 hover:bg-red-600', busy = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={busy ? undefined : onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-emerald-800 mb-2">{title}</h3>
        <p className="text-sm text-emerald-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Batal</button>
          <button onClick={onConfirm} disabled={busy} className={`flex-1 py-2.5 rounded-xl text-white font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${confirmClass}`}>
            {busy ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
