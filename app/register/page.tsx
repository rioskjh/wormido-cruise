'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import UserNavigation from '@/components/UserNavigation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  // 유효성 검증 함수들
  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return '사용자명을 입력해주세요.'
    }
    if (username.length < 6 || username.length > 20) {
      return '사용자명은 6자리 이상 20자리 이하여야 합니다.'
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return '사용자명은 영문과 숫자만 사용할 수 있습니다.'
    }
    return null
  }

  const validateEmail = (email: string): string | null => {
    if (!email || email.trim().length === 0) {
      return '이메일을 입력해주세요.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return '올바른 이메일 형식이 아닙니다.'
    }
    return null
  }

  const validatePhone = (phone: string): string | null => {
    if (!phone || phone.trim().length === 0) {
      return '연락처를 입력해주세요.'
    }
    // 숫자만 허용하고 10-11자리
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phone)) {
      return '연락처는 10-11자리 숫자만 입력해주세요.'
    }
    return null
  }

  const validatePassword = (password: string): string | null => {
    if (!password || password.trim().length === 0) {
      return '비밀번호를 입력해주세요.'
    }
    if (password.length < 6 || password.length > 30) {
      return '비밀번호는 6자리 이상 30자리 이하여야 합니다.'
    }
    // 영문 최소 1자 이상, 특수문자 최소 1자 이상
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    
    if (!hasLetter) {
      return '비밀번호는 영문을 최소 1자 이상 포함해야 합니다.'
    }
    if (!hasSpecialChar) {
      return '비밀번호는 특수문자를 최소 1자 이상 포함해야 합니다.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 유효성 검증
    const usernameError = validateUsername(formData.username)
    if (usernameError) {
      setError(usernameError)
      setLoading(false)
      return
    }

    const emailError = validateEmail(formData.email)
    if (emailError) {
      setError(emailError)
      setLoading(false)
      return
    }

    const phoneError = validatePhone(formData.phone)
    if (phoneError) {
      setError(phoneError)
      setLoading(false)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nickname: formData.name, // name을 nickname으로 전송
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        // 회원가입 성공 시 Toast 알림 표시
        showSuccess('회원가입 완료!', '회원가입이 성공적으로 완료되었습니다. 로그인해주세요.')
        
        // 2초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const errorMessage = data.error || '회원가입에 실패했습니다.'
        setError(errorMessage)
        showError('회원가입 실패', errorMessage)
      }
    } catch (error) {
      const errorMessage = '서버 오류가 발생했습니다.'
      setError(errorMessage)
      showError('서버 오류', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 네비게이션 */}
      <UserNavigation />
      
      {/* 회원가입 폼 */}
      <div className="flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚢 Wormi Cruise
          </h1>
          <p className="text-gray-600">회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자명
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              로그인
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
