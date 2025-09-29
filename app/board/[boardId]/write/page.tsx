'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'
import CKEditor5 from '@/components/CKEditor5'

interface Board {
  id: number
  boardId: string
  title: string
  description: string | null
  type: string
  isAdminOnly: boolean
}

export default function BoardWritePage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  
  const [loading, setLoading] = useState(false)
  const [boardLoading, setBoardLoading] = useState(true)
  const [error, setError] = useState('')
  const [board, setBoard] = useState<Board | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentHtml: '',
    authorName: '',
    password: '',
    isSecret: false
  })
  const [isGuest, setIsGuest] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaGenerated, setCaptchaGenerated] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    // Q&A 게시판이고 로그인하지 않은 경우 기본적으로 비회원 모드
    if (board?.type === 'QNA' && !token) {
      setIsGuest(true)
    }
  }, [board])

  // 게시판 정보 조회
  useEffect(() => {
    const fetchBoardInfo = async () => {
      try {
        const response = await fetch(`/api/board/${boardId}`)
        const data = await response.json()
        
        if (data.ok) {
          setBoard(data.data.board)
          
          // 관리자 전용 게시판인 경우 접근 차단
          if (data.data.board.isAdminOnly) {
            setError('관리자만 글을 작성할 수 있는 게시판입니다.')
            return
          }
        } else {
          setError(data.error || '게시판 정보를 불러올 수 없습니다.')
        }
      } catch (error) {
        setError('게시판 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setBoardLoading(false)
      }
    }

    fetchBoardInfo()
  }, [boardId])

  // 비회원 작성 시 CAPTCHA 생성
  useEffect(() => {
    if (isGuest && !captchaGenerated) {
      generateCaptcha()
    }
  }, [isGuest, captchaGenerated])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const answer = num1 + num2
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setCaptchaAnswer(answer.toString())
    setCaptchaInput('')
    setCaptchaGenerated(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleEditorChange = (contentHtml: string) => {
    setFormData(prev => ({
      ...prev,
      contentHtml: contentHtml,
      content: contentHtml // HTML을 텍스트로도 저장
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    
    if (!formData.contentHtml.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    // 비회원 작성인 경우 추가 검증
    if (isGuest) {
      if (!formData.authorName.trim()) {
        setError('작성자명을 입력해주세요.')
        return
      }
      if (!formData.password.trim()) {
        setError('비밀번호를 입력해주세요.')
        return
      }
      if (!captchaInput || captchaAnswer !== captchaInput.trim()) {
        setError('스팸 방지 문제를 올바르게 입력해주세요.')
        return
      }
    }

    try {
      setLoading(true)
      setError('')

      const requestData = {
        ...formData,
        isGuest: isGuest
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // 회원 작성인 경우에만 토큰 추가
      if (!isGuest) {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('로그인이 필요합니다.')
          setLoading(false)
          return
        }
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/board/${boardId}/write`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (data.ok) {
        router.push(`/board/${boardId}`)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      setError('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 게시판 정보 로딩 중
  if (boardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">게시판 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 게시판이 존재하지 않거나 관리자 전용 게시판인 경우
  if (!board || error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || '존재하지 않는 게시판입니다'}
            </h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      <div className="py-8">
        <div className="container mx-auto px-4">
        {/* 게시판 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href={`/board/${boardId}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← {board.title} 목록으로
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.title} 글쓰기</h1>
          <p className="text-gray-600">{board.description}</p>
        </div>

        {/* 글쓰기 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <CKEditor5
                value={formData.contentHtml}
                onChange={handleEditorChange}
                placeholder="내용을 입력하세요"
              />
            </div>

            {/* Q&A 게시판인 경우 비회원 작성 옵션 */}
            {board?.type === 'QNA' && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">작성자 정보</h3>
                  
                  {/* 로그인 상태에 따른 안내 메시지 */}
                  {isLoggedIn ? (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        회원으로 로그인되어 있습니다. 작성한 글은 회원 정보로 저장됩니다.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        비회원으로 작성합니다. 작성자명과 비밀번호를 입력해주세요.
                      </p>
                    </div>
                  )}
                  
                  {/* 로그인한 경우에만 비회원 모드 선택 가능 */}
                  {isLoggedIn && (
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isGuest}
                          onChange={(e) => setIsGuest(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">비회원으로 작성하기</span>
                      </label>
                    </div>
                  )}

                  {isGuest && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          작성자명 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="authorName"
                          value={formData.authorName}
                          onChange={handleInputChange}
                          placeholder="작성자명을 입력하세요"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={isGuest}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="글 수정/삭제용 비밀번호"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={isGuest}
                        />
                      </div>
                    </div>
                  )}

                  {/* 스팸 방지 CAPTCHA */}
                  {isGuest && captchaQuestion && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        스팸 방지 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg">
                          {captchaQuestion}
                        </div>
                        <input
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="답을 입력하세요"
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                          required
                        />
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          새로고침
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">간단한 수학 문제를 풀어주세요.</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isSecret"
                        checked={formData.isSecret}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">비밀글로 작성하기</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">비밀글은 작성자와 관리자만 볼 수 있습니다.</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3">
              <Link
                href={`/board/${boardId}`}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '작성 중...' : '작성하기'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
