export default function EmptyState({ title, desc }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">📭</div>
      <h3 className="text-xl font-extrabold text-emerald-800">{title}</h3>
      <p className="text-emerald-500 mt-1">{desc}</p>
    </div>
  )
}
