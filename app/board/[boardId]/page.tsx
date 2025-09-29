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
  author: {
    id: number
    username: string
  }
}

interface BoardData {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  
  const [boardData, setBoardData] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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
    if (currentBoard) {
      fetchPosts()
    } else {
      setError('존재하지 않는 게시판입니다.')
      setLoading(false)
    }
  }, [boardId, currentPage, search])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search })
      })

      const response = await fetch(`/api/board/${boardId}?${params}`)
      const data = await response.json()

      if (data.ok) {
        setBoardData(data.data)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentBoard.title}</h1>
          <p className="text-gray-600">{currentBoard.description}</p>
        </div>

        {/* 검색 및 작성 버튼 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목 또는 내용으로 검색..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                검색
              </button>
            </form>
            
            <Link
              href={`/board/${boardId}/write`}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              글쓰기
            </Link>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">게시글을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : boardData && boardData.posts.length > 0 ? (
            <>
              {/* 테이블 헤더 */}
              <div className="bg-gray-50 px-6 py-3 border-b">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-1">번호</div>
                  <div className="col-span-6">제목</div>
                  <div className="col-span-2">작성자</div>
                  <div className="col-span-2">작성일</div>
                  <div className="col-span-1">조회</div>
                </div>
              </div>

              {/* 게시글 목록 */}
              <div className="divide-y divide-gray-200">
                {boardData.posts.map((post, index) => (
                  <div key={post.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 text-sm text-gray-500">
                        {boardData.pagination.total - (boardData.pagination.page - 1) * boardData.pagination.limit - index}
                      </div>
                      <div className="col-span-6">
                        <Link
                          href={`/board/${boardId}/${post.id}`}
                          className="text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <div className="col-span-2 text-sm text-gray-600">
                        {post.author?.username || '비회원'}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="col-span-1 text-sm text-gray-500">
                        {post.views}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {boardData.pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: boardData.pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(boardData.pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === boardData.pagination.totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600">게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
