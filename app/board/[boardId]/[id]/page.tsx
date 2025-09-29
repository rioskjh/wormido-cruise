'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'

interface Post {
  id: number
  title: string
  content: string
  contentHtml?: string
  views: number
  createdAt: string
  updatedAt: string
  authorId?: number
  authorName?: string
  author?: {
    id: number
    username: string
  }
}

interface Board {
  id: number
  boardId: string
  title: string
  description: string | null
  type: string
  isAdminOnly: boolean
}

interface PostData {
  post: Post
  board: Board
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  const postId = params.id as string
  
  const [postData, setPostData] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null)

  // API에서 받은 게시판 정보 사용
  const currentBoard = postData?.board
  const post = postData?.post

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // 토큰에서 사용자 ID 추출 (간단한 방법)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsLoggedIn(true)
        setCurrentUserId(payload.id)
      } catch (error) {
        setIsLoggedIn(false)
        setCurrentUserId(null)
      }
    } else {
      setIsLoggedIn(false)
      setCurrentUserId(null)
    }
  }, [])

  useEffect(() => {
    if (boardId && postId) {
      fetchPost()
    }
  }, [boardId, postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/board/${boardId}/${postId}`)
      const data = await response.json()

      if (data.ok) {
        setPostData(data.data)
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

  // 권한 체크 함수들
  const isAuthor = () => {
    if (!post) return false
    // 회원 작성자인 경우
    if (post.authorId && currentUserId) {
      return post.authorId === currentUserId
    }
    // 비회원 작성자인 경우 (현재는 항상 false, 비밀번호 검증으로 처리)
    return false
  }

  const isGuestPost = () => {
    return post && !post.authorId && post.authorName
  }

  const canEdit = () => {
    if (!post || !currentBoard) return false
    // 관리자 전용 게시판이면 일반 사용자는 수정 불가
    if (currentBoard.isAdminOnly) return false
    // Q&A 게시판이면 작성자만 수정 가능
    if (currentBoard.type === 'QNA') {
      return isAuthor() || isGuestPost()
    }
    return false
  }

  const canDelete = () => {
    return canEdit() // 수정 권한과 동일
  }

  const canWrite = () => {
    if (!currentBoard) return false
    // 관리자 전용 게시판이면 일반 사용자는 글쓰기 불가
    if (currentBoard.isAdminOnly) return false
    // Q&A 게시판만 일반 사용자 글쓰기 가능
    return currentBoard.type === 'QNA'
  }

  // 비밀번호 검증
  const verifyPassword = async (password: string) => {
    try {
      const response = await fetch(`/api/board/${boardId}/${postId}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })
      const data = await response.json()
      return data.ok
    } catch (error) {
      console.error('비밀번호 검증 오류:', error)
      return false
    }
  }

  // 수정/삭제 버튼 클릭 핸들러
  const handleEditClick = () => {
    if (isAuthor()) {
      // 회원 작성자인 경우 바로 수정 페이지로
      router.push(`/board/${boardId}/edit/${postId}`)
    } else if (isGuestPost()) {
      // 비회원 작성자인 경우 비밀번호 입력 모달 표시
      setPendingAction('edit')
      setShowPasswordModal(true)
    }
  }

  const handleDeleteClick = () => {
    if (isAuthor()) {
      // 회원 작성자인 경우 바로 삭제 확인
      if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        deletePost()
      }
    } else if (isGuestPost()) {
      // 비회원 작성자인 경우 비밀번호 입력 모달 표시
      setPendingAction('delete')
      setShowPasswordModal(true)
    }
  }

  // 비밀번호 검증 후 액션 실행
  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError('비밀번호를 입력해주세요.')
      return
    }

    const isValid = await verifyPassword(passwordInput)
    if (isValid) {
      setShowPasswordModal(false)
      setPasswordInput('')
      setPasswordError('')
      
      if (pendingAction === 'edit') {
        router.push(`/board/${boardId}/edit/${postId}`)
      } else if (pendingAction === 'delete') {
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
          deletePost()
        }
      }
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.')
    }
  }

  // 게시글 삭제
  const deletePost = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // 회원 작성자인 경우 토큰 추가
      if (isAuthor()) {
        const token = localStorage.getItem('token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(`/api/board/${boardId}/${postId}`, {
        method: 'DELETE',
        headers
      })
      const data = await response.json()

      if (data.ok) {
        alert('게시글이 삭제되었습니다.')
        router.push(`/board/${boardId}`)
      } else {
        alert(data.error || '게시글 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">게시글을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentBoard) {
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
                    <span>{post.author?.username || post.authorName || '비회원'}</span>
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
                  dangerouslySetInnerHTML={{ __html: post.contentHtml || post.content }}
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
                    {/* 글쓰기 버튼 - Q&A 게시판만 표시 */}
                    {canWrite() && (
                      <Link
                        href={`/board/${boardId}/write`}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        글쓰기
                      </Link>
                    )}
                    
                    {/* 수정 버튼 - 작성자만 표시 */}
                    {canEdit() && (
                      <button
                        onClick={handleEditClick}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                    )}
                    
                    {/* 삭제 버튼 - 작성자만 표시 */}
                    {canDelete() && (
                      <button
                        onClick={handleDeleteClick}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    )}
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
      <Footer />

      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              비밀번호 확인
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {pendingAction === 'edit' ? '게시글을 수정' : '게시글을 삭제'}하려면 비밀번호를 입력해주세요.
            </p>
            
            <div className="mb-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordInput('')
                  setPasswordError('')
                  setPendingAction(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
