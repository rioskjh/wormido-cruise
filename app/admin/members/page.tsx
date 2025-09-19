'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useToast } from '@/contexts/ToastContext'

export const dynamic = 'force-dynamic'

interface Member {
  id: number
  username: string
  email: string
  nickname: string
  role: 'USER' | 'EDITOR' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    reservations: number
    orders: number
  }
}

interface MemberFormData {
  username: string
  email: string
  nickname: string
  role: 'USER' | 'EDITOR' | 'ADMIN'
  isActive: boolean
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState<MemberFormData>({
    username: '',
    email: '',
    nickname: '',
    role: 'USER',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  // 토큰 만료 확인 함수
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // 토큰 갱신 함수
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshTokenValue = localStorage.getItem('adminRefreshToken')
      if (!refreshTokenValue) return null

      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      const data = await response.json()
      if (data.ok) {
        localStorage.setItem('adminToken', data.data.accessToken)
        localStorage.setItem('adminRefreshToken', data.data.refreshToken)
        return data.data.accessToken
      }
      return null
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      return null
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (!newToken) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      await fetchMembers()
      setIsLoading(false)
    }

    checkAuth()
  }, [router, currentPage, searchTerm, roleFilter, statusFilter])

  const fetchMembers = async () => {
    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (newToken) {
          adminToken = newToken
        } else {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('isActive', statusFilter)

      const response = await fetch(`/api/admin/members?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        setMembers(data.data.members)
        setTotalPages(data.data.pagination.totalPages)
        setTotalMembers(data.data.pagination.total)
      } else {
        setError(data.error || '회원 목록을 불러오는데 실패했습니다.')
        showError('회원 목록 로드 실패', data.error || '회원 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('API 호출 에러:', error)
      setError('회원 목록을 불러오는데 실패했습니다.')
      showError('회원 목록 로드 실패', '회원 목록을 불러오는데 실패했습니다.')
    }
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setFormData({
      username: member.username,
      email: member.email,
      nickname: member.nickname,
      role: member.role,
      isActive: member.isActive
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return

    setIsSubmitting(true)

    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (newToken) {
          adminToken = newToken
        } else {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      const response = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.ok) {
        setIsModalOpen(false)
        fetchMembers()
        showSuccess('회원 정보 수정 완료', '회원 정보가 성공적으로 수정되었습니다.')
      } else {
        showError('회원 정보 수정 실패', data.error || '회원 정보 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('회원 정보 수정 에러:', error)
      showError('회원 정보 수정 실패', '회원 정보 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`"${member.username}" 회원을 삭제하시겠습니까?\n\n예약이나 주문이 있는 회원은 삭제할 수 없습니다.`)) {
      return
    }

    try {
      let adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      if (isTokenExpired(adminToken)) {
        const newToken = await refreshToken()
        if (newToken) {
          adminToken = newToken
        } else {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminRefreshToken')
          router.push('/admin/login')
          return
        }
      }

      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.ok) {
        fetchMembers()
        showSuccess('회원 삭제 완료', '회원이 성공적으로 삭제되었습니다.')
      } else {
        showError('회원 삭제 실패', data.error || '회원 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('회원 삭제 에러:', error)
      showError('회원 삭제 실패', '회원 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchMembers()
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    fetchMembers()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800'
      case 'USER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <AdminLayout title="회원 관리" description="회원 정보를 관리할 수 있습니다">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="회원 관리" description="회원 정보를 관리할 수 있습니다">
      <div className="space-y-6">
        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="사용자명, 이메일, 닉네임으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  검색
                </button>
              </div>
            </form>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">모든 역할</option>
                <option value="USER">일반 사용자</option>
                <option value="EDITOR">편집자</option>
                <option value="ADMIN">관리자</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">모든 상태</option>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>
          </div>
        </div>

        {/* 회원 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-800">회원 목록</h3>
                <p className="text-sm text-gray-500 mt-1">
                  총 {totalMembers}명의 회원
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약/주문
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      회원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.nickname}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                          {member.role === 'USER' ? '일반 사용자' : 
                           member.role === 'EDITOR' ? '편집자' : '관리자'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(member.isActive)}`}>
                          {member.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>예약: {member._count.reservations}건</div>
                        <div>주문: {member._count.orders}건</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="text-red-600 hover:text-red-900"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  페이지 {currentPage} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 회원 정보 수정 모달 */}
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg my-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                회원 정보 수정
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자명 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    닉네임 *
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    역할
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'EDITOR' | 'ADMIN' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USER">일반 사용자</option>
                    <option value="EDITOR">편집자</option>
                    <option value="ADMIN">관리자</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">활성</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
