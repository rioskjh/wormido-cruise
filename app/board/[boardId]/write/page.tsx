'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'

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
    content: ''
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/board/${boardId}/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="내용을 입력하세요"
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

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
