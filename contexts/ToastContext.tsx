'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ToastProps } from '@/components/Toast'
import ToastContainer from '@/components/ToastContainer'

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    }
    
    console.log('ToastContext: showToast 호출됨', { id, toast, newToast })
    setToasts((prev) => {
      console.log('ToastContext: 이전 toasts', prev)
      const updated = [...prev, newToast]
      console.log('ToastContext: 업데이트된 toasts', updated)
      return updated
    })
  }, [removeToast])

  const showSuccess = useCallback((title: string, message?: string) => {
    console.log('ToastContext: showSuccess 호출됨', { title, message })
    console.log('ToastContext: showToast 함수 타입:', typeof showToast)
    console.log('ToastContext: showToast 함수 내용:', showToast.toString().substring(0, 200) + '...')
    showToast({ type: 'success', title, message })
  }, [showToast])

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}
