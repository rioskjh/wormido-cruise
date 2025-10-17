'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import { Home } from 'lucide-react' // PNG 이미지로 변경

interface SubNavigationItem {
  label: string
  href?: string
  children?: SubNavigationItem[]
}

interface NavigationItem {
  id: number
  title: string
  url: string | null
  type: 'CUSTOM' | 'PRODUCTS' | 'BOARD' | 'CONTENT' | 'EXTERNAL'
  targetId: number | null
  parentId: number | null
  sortOrder: number
  isActive: boolean
  isNewWindow: boolean
  children: NavigationItem[]
}

interface SubNavigationProps {
  items: SubNavigationItem[]
}

export default function SubNavigation({ items }: SubNavigationProps) {
  const [navigations, setNavigations] = useState<NavigationItem[]>([])
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [selectedMainMenu, setSelectedMainMenu] = useState<string | null>(null)
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    fetchNavigations()
  }, [])

  // 현재 경로에 따라 메뉴 자동 선택
  useEffect(() => {
    if (navigations.length > 0 && !selectedMainMenu) {
      const currentMenu = findCurrentMenuByPath(pathname, navigations)
      if (currentMenu) {
        setSelectedMainMenu(currentMenu.title)
      } else {
        // 경로에 맞는 메뉴가 없으면 첫 번째 메뉴 선택
        setSelectedMainMenu(navigations[0].title)
      }
    }
  }, [navigations, pathname, selectedMainMenu])

  // 현재 경로에 따라 2차 메뉴 자동 선택
  useEffect(() => {
    if (navigations.length > 0 && selectedMainMenu && !selectedSubMenu) {
      const currentSubMenu = findCurrentSubMenuByPath(pathname, navigations)
      if (currentSubMenu) {
        setSelectedSubMenu(currentSubMenu.title)
      } else {
        // 경로에 맞는 2차 메뉴가 없으면 첫 번째 2차 메뉴 선택
        const mainMenu = navigations.find(nav => nav.title === selectedMainMenu)
        if (mainMenu && mainMenu.children && mainMenu.children.length > 0) {
          setSelectedSubMenu(mainMenu.children[0].title)
        }
      }
    }
  }, [navigations, pathname, selectedMainMenu, selectedSubMenu])

  // 팝업 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if ((showMainMenu || showSubMenu) && !target.closest('.relative')) {
        setShowMainMenu(false)
        setShowSubMenu(false)
      }
    }

    if (showMainMenu || showSubMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMainMenu, showSubMenu])

  // 현재 경로에 맞는 메뉴 찾기
  const findCurrentMenuByPath = (currentPath: string, navItems: NavigationItem[]): NavigationItem | null => {
    for (const nav of navItems) {
      // 메인 메뉴 URL과 일치하는지 확인
      if (nav.url && currentPath === nav.url) {
        return nav
      }
      
      // 하위 메뉴 URL과 일치하는지 확인
      if (nav.children && nav.children.length > 0) {
        for (const child of nav.children) {
          if (child.url && currentPath === child.url) {
            return nav // 부모 메뉴 반환
          }
        }
      }
      
      // 상품 관련 페이지인 경우 상품 메뉴 찾기
      if (currentPath.startsWith('/products') && nav.type === 'PRODUCTS') {
        return nav
      }
      
      // 게시판 관련 페이지인 경우 게시판 메뉴 찾기
      if (currentPath.startsWith('/board') && nav.type === 'BOARD') {
        return nav
      }
      
      // 콘텐츠 관련 페이지인 경우 콘텐츠 메뉴 찾기
      if (currentPath.startsWith('/contents') && nav.type === 'CONTENT') {
        return nav
      }
    }
    return null
  }

  // 현재 경로에 맞는 2차 메뉴 찾기
  const findCurrentSubMenuByPath = (currentPath: string, navItems: NavigationItem[]): NavigationItem | null => {
    for (const nav of navItems) {
      if (nav.children && nav.children.length > 0) {
        for (const child of nav.children) {
          // 정확한 URL 매치
          if (child.url && currentPath === child.url) {
            return child // 2차 메뉴 반환
          }
          // 상품 카테고리 URL 매치 (/products?category=1)
          if (child.url && child.url.startsWith('/products?category=') && currentPath.startsWith('/products')) {
            const urlParams = new URLSearchParams(child.url.split('?')[1])
            const currentParams = new URLSearchParams(currentPath.split('?')[1] || '')
            if (urlParams.get('category') === currentParams.get('category')) {
              return child
            }
          }
        }
      }
    }
    return null
  }

  const fetchNavigations = async () => {
    try {
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(7)
      const response = await fetch(`/api/navigations?t=${timestamp}&r=${random}&v=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0',
          'If-None-Match': '*'
        }
      })
      const data = await response.json()

      if (data.ok && Array.isArray(data.data)) {
        setNavigations(data.data)
      } else {
        setNavigations([])
      }
    } catch (error) {
      console.error('네비게이션 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMainMenuClick = (menuTitle: string) => {
    setSelectedMainMenu(menuTitle)
    setShowMainMenu(!showMainMenu)
    // 1차 메뉴 클릭시 2차 메뉴 닫기 (팝업이 열려있든 닫혀있든 항상 닫기)
    setShowSubMenu(false)
  }

  const handleMainMenuSelect = (menu: NavigationItem) => {
    setSelectedMainMenu(menu.title)
    setShowMainMenu(false)
    
    // 메뉴 클릭시 해당 메뉴로 이동
    if (menu.children && menu.children.length > 0) {
      // 2차 메뉴가 있으면 첫 번째 2차 메뉴로 이동
      window.location.href = menu.children[0].url || '#'
    } else if (menu.url) {
      // 1차 메뉴에 직접 URL이 있으면 해당 URL로 이동
      window.location.href = menu.url
    }
  }

  const handleSubMenuClick = (subMenuTitle: string) => {
    setSelectedSubMenu(subMenuTitle)
    setShowSubMenu(!showSubMenu)
    // 2차 메뉴 클릭시 1차 메뉴 닫기
    setShowMainMenu(false)
  }

  const handleSubMenuSelect = (subMenu: NavigationItem) => {
    setSelectedSubMenu(subMenu.title)
    setShowSubMenu(false)
    
    // 2차 메뉴 클릭시 해당 URL로 이동
    if (subMenu.url) {
      window.location.href = subMenu.url
    }
  }

  const getCurrentMainMenu = () => {
    if (!selectedMainMenu) return null
    return navigations.find(nav => nav.title === selectedMainMenu)
  }

  const getCurrentSubMenu = () => {
    if (!selectedSubMenu) return null
    const mainMenu = getCurrentMainMenu()
    if (!mainMenu || !mainMenu.children) return null
    return mainMenu.children.find(child => child.title === selectedSubMenu)
  }

  const renderMainMenuPopup = () => {
    if (!showMainMenu || navigations.length === 0) return null

    const currentMenu = getCurrentMainMenu()
    const currentIndex = currentMenu ? navigations.findIndex(nav => nav.id === currentMenu.id) : 0

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border border-[#dddddd] rounded-[4px] shadow-lg z-50 overflow-hidden w-full md:w-auto">
        <div className="flex flex-col">
          {navigations.map((menu, index) => {
            const isSelected = index === currentIndex
            const isFirst = index === 0
            const isLast = index === navigations.length - 1

    return (
      <div
                key={menu.id}
                onClick={() => handleMainMenuSelect(menu)}
                className={`
                  box-border content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative shrink-0 w-full md:w-[200px] cursor-pointer
                  ${isSelected 
                    ? 'bg-[#190a6b] text-white' 
                    : 'bg-white text-[#222222] hover:bg-gray-50'
                  }
                  ${isFirst ? 'rounded-tl-[4px] rounded-tr-[4px]' : ''}
                  ${isLast ? 'rounded-bl-[4px] rounded-br-[4px]' : ''}
                `}
              >
                {!isSelected && (
                  <div className={`absolute border border-[#dddddd] border-solid inset-0 pointer-events-none ${
                    isFirst ? 'rounded-tl-[4px] rounded-tr-[4px]' : ''
                  } ${isLast ? 'rounded-bl-[4px] rounded-br-[4px]' : ''} ${
                    !isLast ? 'border-b-0' : ''
                  }`} />
                )}
                <p className="font-['Pretendard:Medium',_sans-serif] leading-[30px] md:leading-[30px] leading-[20px] not-italic relative shrink-0 text-[16px] md:text-[16px] text-[14px] text-nowrap whitespace-pre">
                  {menu.title}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderSubMenuPopup = () => {
    const mainMenu = getCurrentMainMenu()
    if (!showSubMenu || !mainMenu || !mainMenu.children || mainMenu.children.length === 0) return null

    const currentSubMenu = getCurrentSubMenu()
    const currentIndex = currentSubMenu ? mainMenu.children.findIndex(child => child.id === currentSubMenu.id) : 0

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border border-[#dddddd] rounded-[4px] shadow-lg z-50 overflow-hidden w-full md:w-auto">
        <div className="flex flex-col">
          {mainMenu.children.map((subMenu, index) => {
            const isSelected = index === currentIndex
            const isFirst = index === 0
            const isLast = index === mainMenu.children.length - 1
            
            return (
              <div
                key={subMenu.id}
                onClick={() => handleSubMenuSelect(subMenu)}
                className={`
                  box-border content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative shrink-0 w-full md:w-[200px] cursor-pointer
                  ${isSelected 
                    ? 'bg-[#190a6b] text-white' 
                    : 'bg-white text-[#222222] hover:bg-gray-50'
                  }
                  ${isFirst ? 'rounded-tl-[4px] rounded-tr-[4px]' : ''}
                  ${isLast ? 'rounded-bl-[4px] rounded-br-[4px]' : ''}
                `}
              >
                {!isSelected && (
                  <div className={`absolute border border-[#dddddd] border-solid inset-0 pointer-events-none ${
                    isFirst ? 'rounded-tl-[4px] rounded-tr-[4px]' : ''
                  } ${isLast ? 'rounded-bl-[4px] rounded-br-[4px]' : ''} ${
                    !isLast ? 'border-b-0' : ''
                  }`} />
                )}
                <p className="font-['Pretendard:Medium',_sans-serif] leading-[30px] md:leading-[30px] leading-[20px] not-italic relative shrink-0 text-[16px] md:text-[16px] text-[14px] text-nowrap whitespace-pre">
                  {subMenu.title}
                </p>
                </div>
            )
          })}
          </div>
      </div>
    )
  }

  // 현재 2차 메뉴 찾기
  const currentSubMenu = findCurrentSubMenuByPath(pathname, navigations)
  const isProductsPage = pathname.startsWith('/products')

  return (
    <nav className="bg-white py-5">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex items-center gap-[30px] relative md:gap-[30px] gap-[10px]">
          {/* 홈 버튼 - 모바일 20% */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity w-[20%] md:w-auto justify-center md:justify-start">
            <img 
              src="/images/home-icon.png" 
              alt="홈" 
              className="w-6 h-6" 
            />
          </Link>

          {/* 상품예약 페이지이고 2차 메뉴가 있는 경우 브레드크럼 형태로 표시 */}
          {isProductsPage && currentSubMenu ? (
            <>
              {/* 상품예약 메뉴 - 모바일 40% + 40% */}
              <div className="flex items-center gap-[10px] w-[40%] md:w-auto">
                <span className="font-['Pretendard:Medium',_sans-serif] text-[17px] md:text-[17px] text-[14px] text-[#222222] leading-[30px] md:leading-[30px] leading-[20px] truncate">
                  상품예약
                </span>
              </div>
              <div className="flex items-center gap-[10px] w-[40%] md:w-auto">
                <span className="text-[#666666] text-[14px] md:text-[17px]">{'>'}</span>
                <span className="font-['Pretendard:Medium',_sans-serif] text-[17px] md:text-[17px] text-[14px] text-[#222222] leading-[30px] md:leading-[30px] leading-[20px] truncate">
                  {currentSubMenu.title}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* 메인 메뉴 선택 버튼 - 모바일 40% */}
              <div className="relative w-[40%] md:w-auto">
                <div 
                  className="flex items-center justify-between w-full md:w-[200px] cursor-pointer"
                  onClick={() => {
                    setShowMainMenu(!showMainMenu)
                    setShowSubMenu(false) // 1차 메뉴 클릭시 2차 메뉴 팝업 닫기
                  }}
                >
                  <p className="font-['Pretendard:Medium',_sans-serif] text-[17px] md:text-[17px] text-[14px] text-[#222222] leading-[30px] md:leading-[30px] leading-[20px] truncate">
                    {selectedMainMenu || (navigations.length > 0 ? navigations[0].title : '메뉴 선택')}
                  </p>
                  <div className={`transform transition-transform duration-200 ${showMainMenu ? '' : 'rotate-180'}`}>
                    <img 
                      src="/images/arrow-up-icon.png" 
                      alt="화살표" 
                      className="w-[18px] h-[18px] md:w-[18px] md:h-[18px] w-[14px] h-[14px]" 
                    />
                  </div>
                </div>

                {/* 메인 메뉴 팝업 */}
                {renderMainMenuPopup()}
              </div>

              {/* 서브 메뉴 (현재 선택된 메인 메뉴의 하위 메뉴들) - 모바일 40% */}
              {getCurrentMainMenu()?.children && getCurrentMainMenu()!.children.length > 0 && (
                <div className="flex items-center gap-[30px] w-[40%] md:w-auto">
                  {/* 2차 메뉴 선택 버튼 */}
                  <div className="relative w-full md:w-auto">
                    <div 
                      className="flex items-center justify-between w-full md:w-[200px] cursor-pointer"
                      onClick={() => handleSubMenuClick(selectedSubMenu || getCurrentMainMenu()!.children[0].title)}
                    >
                      <p className="font-['Pretendard:Medium',_sans-serif] text-[17px] md:text-[17px] text-[14px] text-[#222222] leading-[30px] md:leading-[30px] leading-[20px] truncate">
                        {selectedSubMenu || getCurrentMainMenu()!.children[0].title}
                      </p>
                      <div className={`transform transition-transform duration-200 ${showSubMenu ? '' : 'rotate-180'}`}>
                        <img 
                          src="/images/arrow-up-icon.png" 
                          alt="화살표" 
                          className="w-[18px] h-[18px] md:w-[18px] md:h-[18px] w-[14px] h-[14px]" 
                        />
                      </div>
                    </div>

                    {/* 2차 메뉴 팝업 */}
                    {renderSubMenuPopup()}
                  </div>
            </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
