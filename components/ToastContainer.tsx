'use client'

import Toast, { ToastProps } from './Toast'

interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  console.log('ToastContainer: 렌더링됨', { toastsCount: Array.isArray(toasts) ? toasts.length : 0, toasts })
  
  if (!Array.isArray(toasts) || toasts.length === 0) {
    console.log('ToastContainer: toasts가 비어있음, null 반환')
    return null
  }

  console.log('ToastContainer: toasts 렌더링 중', toasts)
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm" style={{ zIndex: 9999 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}
