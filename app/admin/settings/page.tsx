'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavigation from '@/components/AdminNavigation'
import { useToast } from '@/contexts/ToastContext'

interface SiteSetting {
  id: number
  key: string
  value: string
  description?: string
  category: string
  isActive: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    checkAuth()
    loadSettings()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.ok) {
        setSettings(data.data.settings)
      } else {
        showError('설정 로드 실패', data.error || '설정을 불러올 수 없습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()
      
      if (data.ok) {
        showSuccess('설정 저장 완료', '설정이 성공적으로 저장되었습니다.')
      } else {
        showError('저장 실패', data.error || '설정 저장에 실패했습니다.')
      }
    } catch (error) {
      showError('서버 오류', '서버 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (id: number, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ))
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, SiteSetting[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">설정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">사이트 설정 관리</h1>
            <p className="text-gray-600">사이트 제목, SEO 정보, 푸터 정보 등을 관리할 수 있습니다.</p>
          </div>

          {/* 설정 폼 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  {category === 'seo' ? 'SEO 및 사이트 정보' : 
                   category === 'footer' ? '푸터 정보' : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categorySettings.map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {setting.description || setting.key}
                      </label>
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => updateSetting(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={setting.description || setting.key}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 저장 버튼 */}
            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
