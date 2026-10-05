import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import Toast from '../components/ui/Toast'
import { ToastContext, type ToastVariant } from './toast-context'

const TOAST_DURATION_MS = 2800

interface ToastState {
  message: string
  variant: ToastVariant
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    clearTimeout(timer.current)
    setToast({ message, variant })
    setVisible(true)
    timer.current = setTimeout(() => setVisible(false), TOAST_DURATION_MS)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'success'}
        visible={visible}
      />
    </ToastContext.Provider>
  )
}
