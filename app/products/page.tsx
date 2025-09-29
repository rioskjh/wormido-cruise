'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import UserNavigation from '@/components/UserNavigation'
import Footer from '@/components/Footer'

interface Product {
  id: number
  name: string
  description: string
  basePrice: number
  adultPrice: number
  childPrice: number
  infantPrice: number
  maxCapacity: number
  category: {
    id: number
    name: string
  }
  images: {
    id: number
    fileName: string
    filePath: string
    sortOrder: number
  }[]
}

interface Category {
  id: number
  name: string
  sortOrder: number
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      if (categoryId) {
        const category = categories.find(cat => cat.id.toString() === categoryId)
        if (category) {
          setSelectedCategory(category)
          fetchProducts(category.id)
        } else {
          setError('존재하지 않는 카테고리입니다.')
          setLoading(false)
        }
      } else {
        // 카테고리가 선택되지 않은 경우 첫 번째 카테고리로 설정
        setSelectedCategory(categories[0])
        fetchProducts(categories[0].id)
      }
    }
  }, [categories, categoryId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.ok) {
        setCategories(data.data)
      } else {
        setError('카테고리를 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    }
  }

  const fetchProducts = async (categoryId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?category=${categoryId}`)
      const data = await response.json()
      
      if (data.ok) {
        setProducts(data.data.products)
      } else {
        setError('상품을 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    fetchProducts(category.id)
    // URL 업데이트
    const url = new URL(window.location.href)
    url.searchParams.set('category', category.id.toString())
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-design-gray font-pretendard mb-2">상품 예약</h1>
            <p className="text-design-gray-light font-pretendard">원하는 상품을 선택하여 예약하세요</p>
          </div>

          {/* 카테고리 탭 */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-3 rounded-lg font-pretendard font-medium transition-all duration-200 ${
                    selectedCategory?.id === category.id
                      ? 'bg-design-blue text-white shadow-lg'
                      : 'bg-white text-design-gray border border-gray-200 hover:border-design-blue hover:text-design-blue'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 상품 목록 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-design-blue"></div>
              <p className="mt-4 text-design-gray-light font-pretendard text-lg">상품을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center font-pretendard">
              {error}
            </div>
          ) : (
            <>
              {/* 선택된 카테고리 정보 */}
              {selectedCategory && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-design-gray font-pretendard">
                    {selectedCategory.name}
                  </h2>
                  <p className="text-design-gray-light font-pretendard">
                    총 {products.length}개의 상품이 있습니다
                  </p>
                </div>
              )}

              {/* 3x3 그리드 레이아웃 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  // 업로드된 이미지가 있으면 사용, 없으면 기본 이미지 사용
                  const hasUploadedImage = product.images && product.images.length > 0
                  const imageSrc = hasUploadedImage 
                    ? product.images[0].filePath 
                    : `/images/0279006e5653701283e6e34a07b609333312b52a.png`
                  
                  return (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.id}`}
                      className="group bg-white rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:transform hover:scale-105"
                    >
                      {/* 상품 이미지 */}
                      <div className="relative h-[250px] overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                        
                        {/* 카테고리 배지 */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-design-purple text-white text-xs font-medium px-3 py-1 rounded-full font-pretendard">
                            {product.category.name}
                          </span>
                        </div>
                        
                        {/* 최대 인원 배지 */}
                        <div className="absolute bottom-4 right-4">
                          <span className="bg-white bg-opacity-90 text-design-gray text-xs font-medium px-2 py-1 rounded font-pretendard">
                            최대 {product.maxCapacity}명
                          </span>
                        </div>
                      </div>

                      {/* 상품 정보 */}
                      <div className="p-6">
                        {/* 상품 제목 */}
                        <h3 className="font-bold text-design-gray font-pretendard text-xl mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* 상품 설명 */}
                        <p className="text-design-gray-light font-pretendard text-sm mb-4 line-clamp-2">
                          {product.description || '상품 설명이 없습니다.'}
                        </p>
                        
                        {/* 가격 정보 */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-design-gray font-pretendard text-sm">성인</span>
                            <span className="font-bold text-design-gray font-pretendard text-sm">
                              {product.adultPrice.toLocaleString()}원
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-design-gray font-pretendard text-sm">어린이</span>
                            <span className="font-bold text-design-gray font-pretendard text-sm">
                              {product.childPrice.toLocaleString()}원
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-design-gray font-pretendard text-sm">유아</span>
                            <span className="font-bold text-design-gray font-pretendard text-sm">
                              {product.infantPrice.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                        
                        {/* 예약 버튼 */}
                        <div className="w-full bg-design-blue hover:bg-blue-600 text-white text-center py-3 rounded-lg font-pretendard font-semibold transition-colors duration-200">
                          예약하기
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* 상품이 없는 경우 */}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-design-gray-light font-pretendard text-lg">
                    {selectedCategory?.name} 카테고리에 등록된 상품이 없습니다.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
