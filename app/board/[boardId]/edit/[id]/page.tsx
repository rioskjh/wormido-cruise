'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  authorId: number
}

export default function BoardEditPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  const postId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [post, setPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })

  // 게시판 정보
  const boardInfo = {
    notice: { title: '공지사항', description: '월미도 크루즈의 주요 공지사항을 확인하세요.' },
    event: { title: '이벤트', description: '다양한 이벤트와 혜택을 만나보세요.' },
    review: { title: '리뷰', description: '고객님들의 생생한 후기를 확인하세요.' },
    faq: { title: 'FAQ', description: '자주 묻는 질문과 답변을 확인하세요.' },
    qna: { title: 'Q&A', description: '궁금한 점을 질문하고 답변을 받아보세요.' }
  }

  const currentBoard = boardInfo[boardId as keyof typeof boardInfo]

  useEffect(() => {
    if (currentBoard && postId) {
      fetchPost()
    } else {
      setError('존재하지 않는 게시판 또는 게시글입니다.')
      setLoading(false)
    }
  }, [boardId, postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/board/${boardId}/edit/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (data.ok) {
        setPost(data.data)
        setFormData({
          title: data.data.title,
          content: data.data.content
        })
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
      setError('게시글을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

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
      setSubmitLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다.')
        setSubmitLoading(false)
        return
      }

      const response = await fetch(`/api/board/${boardId}/edit/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.ok) {
        router.push(`/board/${boardId}/${postId}`)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error)
      setError('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">존재하지 않는 게시판입니다</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 게시판 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href={`/board/${boardId}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← {currentBoard.title} 목록으로
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentBoard.title} 글수정</h1>
          <p className="text-gray-600">{currentBoard.description}</p>
        </div>

        {/* 글수정 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">게시글을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Link 
                href={`/board/${boardId}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              >
                목록으로 돌아가기
              </Link>
            </div>
          ) : post ? (
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
                  href={`/board/${boardId}/${postId}`}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? '수정 중...' : '수정하기'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
              <Link 
                href={`/board/${boardId}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              >
                목록으로 돌아가기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
