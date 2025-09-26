'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'

interface Post {
  id: number
  type: 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA'
  title: string
  contentHtml: string
  isNotice: boolean
  isSecret: boolean
  authorName: string | null
  views: number
  createdAt: string
  updatedAt: string
  author?: {
    id: number
    username: string
  }
}

interface BoardStats {
  totalPosts: number
  noticePosts: number
  eventPosts: number
  reviewPosts: number
  faqPosts: number
  qnaPosts: number
}

function AdminBoardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSuccess, showError } = useToast()
  
  // URL 파라미터에서 타입 가져오기
  const typeParam = searchParams.get('type') as 'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA'
  const initialTab = (typeParam && ['NOTICE', 'EVENT', 'REVIEW', 'FAQ', 'QNA'].includes(typeParam)) ? typeParam : 'NOTICE'
  
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'EVENT' | 'REVIEW' | 'FAQ' | 'QNA'>(initialTab)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<BoardStats>({
    totalPosts: 0,
    noticePosts: 0,
    eventPosts: 0,
    reviewPosts: 0,
    faqPosts: 0,
    qnaPosts: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'title'>('latest')

  const boardTypes = [
    { key: 'NOTICE', name: '공지사항', icon: '📢', color: 'bg-blue-100 text-blue-800' },
    { key: 'EVENT', name: '이벤트', icon: '🎉', color: 'bg-green-100 text-green-800' },
    { key: 'REVIEW', name: '리뷰', icon: '⭐', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'FAQ', name: 'FAQ', icon: '❓', color: 'bg-purple-100 text-purple-800' },
    { key: 'QNA', name: 'Q&A', icon: '💬', color: 'bg-orange-100 text-orange-800' }
  ] as const

  useEffect(() => {
    fetchPosts()
    fetchStats()
  }, [activeTab, searchTerm, sortBy])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        type: activeTab,
        search: searchTerm,
        sort: sortBy
      })
      
      const response = await fetch(`/api/admin/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('게시글 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/board/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('게시판 통계 조회 오류:', error)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        showSuccess('게시글 삭제 완료', '게시글이 삭제되었습니다.')
        fetchPosts()
        fetchStats()
      } else {
        const error = await response.json()
        showError('게시글 삭제 실패', error.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      showError('게시글 삭제 오류', '게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleToggleNotice = async (postId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isNotice: !currentStatus
        })
      })

      if (response.ok) {
        showSuccess('공지 상태 변경 완료', '공지 상태가 변경되었습니다.')
        fetchPosts()
      } else {
        const error = await response.json()
        showError('공지 상태 변경 실패', error.error || '공지 상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('공지 상태 변경 오류:', error)
      showError('공지 상태 변경 오류', '공지 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBoardTypeInfo = (type: string) => {
    return boardTypes.find(bt => bt.key === type) || boardTypes[0]
  }

  return (
    <AdminLayout title="게시판 관리" description="게시판별 게시글을 관리할 수 있습니다.">
      <div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-lg">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">전체 게시글</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
            </div>
          </div>
          
          {boardTypes.map((boardType) => (
            <div key={boardType.key} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${boardType.color}`}>
                  <span className="text-lg">{boardType.icon}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{boardType.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {boardType.key === 'NOTICE' ? stats.noticePosts :
                     boardType.key === 'EVENT' ? stats.eventPosts :
                     boardType.key === 'REVIEW' ? stats.reviewPosts :
                     boardType.key === 'FAQ' ? stats.faqPosts :
                     stats.qnaPosts}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 게시판 탭 */}
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {boardTypes.map((boardType) => (
                <button
                  key={boardType.key}
                  onClick={() => setActiveTab(boardType.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === boardType.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{boardType.icon}</span>
                  {boardType.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 검색 및 정렬 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'views' | 'title')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="latest">최신순</option>
                  <option value="views">조회수순</option>
                  <option value="title">제목순</option>
                </select>
                <button
                  onClick={() => router.push(`/admin/board/write?type=${activeTab}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  새 글 작성
                </button>
              </div>
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">로딩 중...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>게시글이 없습니다.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      조회수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.isNotice && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                              공지
                            </span>
                          )}
                          {post.isSecret && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                              🔒
                            </span>
                          )}
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {post.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.author?.username || post.authorName || '비회원'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBoardTypeInfo(post.type).color}`}>
                          {getBoardTypeInfo(post.type).icon} {getBoardTypeInfo(post.type).name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/board/edit/${post.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            수정
                          </button>
                          {activeTab === 'NOTICE' && (
                            <button
                              onClick={() => handleToggleNotice(post.id, post.isNotice)}
                              className={`${post.isNotice ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {post.isNotice ? '공지해제' : '공지등록'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminBoardPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="게시판 관리" description="게시판별 게시글을 관리할 수 있습니다.">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </AdminLayout>
    }>
      <AdminBoardPageContent />
    </Suspense>
  )
}
