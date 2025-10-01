'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          {/* 홈 아이콘 */}
          <Link 
            href="/" 
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          
          {/* 경로 아이템들 */}
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
