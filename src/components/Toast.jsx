import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({ show: () => {}, hide: () => {} })

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
      <div className="fixed top-4 right-4 z-50 pointer-events-none w-full max-w-xs md:max-w-sm">
        {t && (
          <div className={`pointer-events-auto rounded-2xl px-5 py-4 shadow-2xl text-white font-medium flex items-center gap-3 transition ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
            <span>{t.type === 'success' ? '✓' : '✗'}</span>
            <span className="text-sm">{t.msg}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
