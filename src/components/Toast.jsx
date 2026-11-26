import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({ show: () => {}, hide: () => {} })

const gaya = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-50 border border-emerald-200 dark:border-emerald-700',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-50 border border-red-200 dark:border-red-700',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-50 border border-blue-200 dark:border-blue-700',
}

function Ikon({ type }) {
  if (type === 'error') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  }
  if (type === 'info') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export const ToastProvider = ({ children }) => {
  const [t, setT] = useState(null)
  const show = useCallback((msg, type = 'success') => {
    setT({ msg, type })
    setTimeout(() => setT(null), 3000)
  }, [])
  const hide = useCallback(() => setT(null), [])

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[calc(100%-2rem)] max-w-md">
        {t && (
          <div className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-2xl font-medium flex items-start gap-3 ${gaya[t.type] || gaya.success}`}>
            <span className="shrink-0 mt-0.5"><Ikon type={t.type} /></span>
            <span className="text-sm break-words">{t.msg}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
