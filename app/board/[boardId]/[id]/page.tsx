'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  views: number
  createdAt: string
  updatedAt: string
  author: {
    id: number
    username: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  const postId = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      const response = await fetch(`/api/board/${boardId}/${postId}`)
      const data = await response.json()

      if (data.ok) {
        setPost(data.data)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentBoard.title}</h1>
          <p className="text-gray-600">{currentBoard.description}</p>
        </div>

        {/* 게시글 상세 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
            <>
              {/* 게시글 헤더 */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">작성자:</span>
                    <span>{post.author?.username || '비회원'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">작성일:</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  {post.updatedAt !== post.createdAt && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">수정일:</span>
                      <span>{formatDate(post.updatedAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">조회수:</span>
                    <span>{post.views}</span>
                  </div>
                </div>
              </div>

              {/* 게시글 내용 */}
              <div className="p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* 게시글 하단 버튼 */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <Link
                    href={`/board/${boardId}`}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    목록
                  </Link>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/board/${boardId}/write`}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      글쓰기
                    </Link>
                    <Link
                      href={`/board/${boardId}/edit/${post.id}`}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      수정
                    </Link>
                  </div>
                </div>
              </div>
            </>
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
