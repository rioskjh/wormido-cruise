'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import UserNavigation from '@/components/UserNavigation'

interface User {
  id: number
  username: string
  email: string
  nickname: string
  phone: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
        setFormData({
          email: data.data.user.email,
          nickname: data.data.user.nickname,
          phone: data.data.user.phone,
          password: '',
          confirmPassword: '',
        })
      } else {
        showError('프로필 조회 실패', '프로필 정보를 불러올 수 없습니다.')
        router.push('/login')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // 유효성 검증 함수들
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
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phone)) {
      return '연락처는 10-11자리 숫자만 입력해주세요.'
    }
    return null
  }

  const validatePassword = (password: string): string | null => {
    if (password && password.trim().length > 0) {
      if (password.length < 6 || password.length > 30) {
        return '비밀번호는 6자리 이상 30자리 이하여야 합니다.'
      }
      const hasLetter = /[a-zA-Z]/.test(password)
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      
      if (!hasLetter) {
        return '비밀번호는 영문을 최소 1자 이상 포함해야 합니다.'
      }
      if (!hasSpecialChar) {
        return '비밀번호는 특수문자를 최소 1자 이상 포함해야 합니다.'
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // 유효성 검증
    const emailError = validateEmail(formData.email)
    if (emailError) {
      setError(emailError)
      setSaving(false)
      return
    }

    const phoneError = validatePhone(formData.phone)
    if (phoneError) {
      setError(phoneError)
      setSaving(false)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setSaving(false)
      return
    }

    // 비밀번호 확인
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const updateData: any = {
        email: formData.email,
        nickname: formData.nickname,
        phone: formData.phone,
      }

      // 비밀번호가 입력된 경우에만 포함
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.ok) {
        showSuccess('프로필 수정 완료', '프로필이 성공적으로 수정되었습니다.')
        setUser(data.data.user)
        
        // 인증 상태 변경 이벤트 발생 (네비게이션 업데이트)
        window.dispatchEvent(new Event('authStateChanged'))
        
        // 비밀번호 필드 초기화
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }))
      } else {
        setError(data.error || '프로필 수정에 실패했습니다.')
        showError('프로필 수정 실패', data.error || '프로필 수정에 실패했습니다.')
      }
    } catch (error) {
      const errorMessage = '서버 오류가 발생했습니다.'
      setError(errorMessage)
      showError('서버 오류', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">프로필을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 네비게이션 */}
      <UserNavigation />
      
      {/* 프로필 수정 폼 */}
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚢 Wormi Cruise
            </h1>
            <p className="text-gray-600">프로필 수정</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                사용자명 (변경 불가)
              </label>
              <input
                type="text"
                id="username"
                value={user?.username || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
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
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                연락처
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
                새 비밀번호 (변경하지 않으려면 비워두세요)
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="영문, 특수문자 포함 6-30자"
              />
            </div>

            {formData.password && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? '수정 중...' : '프로필 수정'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <a href="/" className="text-blue-600 hover:text-blue-500">
                메인으로 돌아가기
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
