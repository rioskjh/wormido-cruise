'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'

function LoginContent() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFindIdModal, setShowFindIdModal] = useState(false)
  const [showFindPasswordModal, setShowFindPasswordModal] = useState(false)
  const [findIdData, setFindIdData] = useState({ name: '', email: '' })
  const [findPasswordData, setFindPasswordData] = useState({ username: '', name: '', email: '' })
  const [findIdLoading, setFindIdLoading] = useState(false)
  const [findPasswordLoading, setFindPasswordLoading] = useState(false)
  const [findIdResult, setFindIdResult] = useState('')
  const [findIdError, setFindIdError] = useState('')
  const [findPasswordError, setFindPasswordError] = useState('')
  const [findPasswordSuccess, setFindPasswordSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.ok) {
        // 토큰을 localStorage에 저장
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        
        // 인증 상태 변경 이벤트 발생
        window.dispatchEvent(new Event('authStateChanged'))
        
        // returnUrl이 있으면 해당 페이지로, 없으면 홈페이지로 리다이렉트
        const redirectUrl = returnUrl ? decodeURIComponent(returnUrl) : '/'
        router.push(redirectUrl)
      } else {
        setError(data.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault()
    setFindIdLoading(true)
    setFindIdError('')
    setFindIdResult('')

    try {
      const response = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(findIdData),
      })

      const data = await response.json()

      if (data.ok) {
        setFindIdResult(data.data.username)
      } else {
        setFindIdError(data.error || '아이디를 찾을 수 없습니다.')
      }
    } catch (error) {
      setFindIdError('서버 오류가 발생했습니다.')
    } finally {
      setFindIdLoading(false)
    }
  }

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFindPasswordLoading(true)
    setFindPasswordError('')
    setFindPasswordSuccess('')

    try {
      const response = await fetch('/api/auth/find-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(findPasswordData),
      })

      const data = await response.json()

      if (data.ok) {
        setFindPasswordSuccess('비밀번호 재설정 링크가 이메일로 전송되었습니다.')
        setFindPasswordData({ username: '', name: '', email: '' })
      } else {
        setFindPasswordError(data.error || '정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      setFindPasswordError('서버 오류가 발생했습니다.')
    } finally {
      setFindPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 네비게이션 */}
      <UserNavigation />
      
      {/* 로그인 폼 */}
      <div className="flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚢 Wormi Cruise
          </h1>
          <p className="text-gray-600">로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div className="flex justify-center space-x-4 text-sm">
            <button
              type="button"
              onClick={() => setShowFindIdModal(true)}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              아이디 찾기
            </button>
            <span className="text-gray-400">|</span>
            <button
              type="button"
              onClick={() => setShowFindPasswordModal(true)}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              비밀번호 찾기
            </button>
          </div>
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-500">
              회원가입
            </a>
          </p>
        </div>
      </div>
      </div>
      
      {/* 아이디 찾기 모달 */}
      {showFindIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">아이디 찾기</h2>
              <button
                onClick={() => {
                  setShowFindIdModal(false)
                  setFindIdData({ name: '', email: '' })
                  setFindIdResult('')
                  setFindIdError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!findIdResult ? (
              <form onSubmit={handleFindId} className="space-y-4">
                <div>
                  <label htmlFor="findIdName" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    id="findIdName"
                    value={findIdData.name}
                    onChange={(e) => setFindIdData({ ...findIdData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="findIdEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="findIdEmail"
                    value={findIdData.email}
                    onChange={(e) => setFindIdData({ ...findIdData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {findIdError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {findIdError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={findIdLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {findIdLoading ? '찾는 중...' : '아이디 찾기'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                  <p className="font-medium">아이디를 찾았습니다!</p>
                  <p className="text-lg font-bold mt-2">{findIdResult}</p>
                </div>
                <button
                  onClick={() => {
                    setShowFindIdModal(false)
                    setFindIdData({ name: '', email: '' })
                    setFindIdResult('')
                    setFindIdError('')
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 비밀번호 찾기 모달 */}
      {showFindPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">비밀번호 찾기</h2>
              <button
                onClick={() => {
                  setShowFindPasswordModal(false)
                  setFindPasswordData({ username: '', name: '', email: '' })
                  setFindPasswordError('')
                  setFindPasswordSuccess('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!findPasswordSuccess ? (
              <form onSubmit={handleFindPassword} className="space-y-4">
                <div>
                  <label htmlFor="findPasswordUsername" className="block text-sm font-medium text-gray-700 mb-2">
                    아이디
                  </label>
                  <input
                    type="text"
                    id="findPasswordUsername"
                    value={findPasswordData.username}
                    onChange={(e) => setFindPasswordData({ ...findPasswordData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="findPasswordName" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    id="findPasswordName"
                    value={findPasswordData.name}
                    onChange={(e) => setFindPasswordData({ ...findPasswordData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="findPasswordEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="findPasswordEmail"
                    value={findPasswordData.email}
                    onChange={(e) => setFindPasswordData({ ...findPasswordData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {findPasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {findPasswordError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={findPasswordLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {findPasswordLoading ? '전송 중...' : '비밀번호 재설정 링크 전송'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                  <p className="font-medium">{findPasswordSuccess}</p>
                  <p className="text-sm mt-2">이메일을 확인해주세요.</p>
                </div>
                <button
                  onClick={() => {
                    setShowFindPasswordModal(false)
                    setFindPasswordData({ username: '', name: '', email: '' })
                    setFindPasswordError('')
                    setFindPasswordSuccess('')
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
