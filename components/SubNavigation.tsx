'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
  items?: SubNavigationItem[]
}

function SubNavigationContent({ items = [] }: SubNavigationProps) {
  const [navigations, setNavigations] = useState<NavigationItem[]>([])
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [selectedMainMenu, setSelectedMainMenu] = useState<string | null>(null)
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 전체 경로 구성 (쿼리 파라미터 포함)
  const fullPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

  useEffect(() => {
    fetchNavigations()
  }, [])

  // 현재 경로에 따라 메뉴 자동 선택
  useEffect(() => {
    if (navigations.length > 0 && !selectedMainMenu) {
      console.log('현재 경로:', pathname)
      console.log('전체 경로:', fullPath)
      console.log('네비게이션 데이터:', navigations)
      const currentMenu = findCurrentMenuByPath(fullPath, navigations)
      console.log('찾은 메뉴:', currentMenu)
      if (currentMenu) {
        setSelectedMainMenu(currentMenu.title)
      } else {
        // 경로에 맞는 메뉴가 없으면 첫 번째 메뉴 선택
        console.log('메뉴를 찾지 못함, 첫 번째 메뉴 선택:', navigations[0].title)
        setSelectedMainMenu(navigations[0].title)
      }
    }
  }, [navigations, fullPath, selectedMainMenu])

  // 현재 경로에 따라 2차 메뉴 자동 선택
  useEffect(() => {
    if (navigations.length > 0 && selectedMainMenu && !selectedSubMenu) {
      const currentSubMenu = findCurrentSubMenuByPath(fullPath, navigations)
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
  }, [navigations, fullPath, selectedMainMenu, selectedSubMenu])

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
    console.log('findCurrentMenuByPath 호출:', currentPath)
    
    // 먼저 하위 메뉴 URL과 정확히 일치하는지 확인
    for (const nav of navItems) {
      if (nav.children && nav.children.length > 0) {
        for (const child of nav.children) {
          console.log('하위 메뉴 검사:', child.title, child.url)
          if (child.url && currentPath === child.url) {
            console.log('하위 메뉴 URL 일치:', child.title, '부모:', nav.title)
            return nav // 부모 메뉴 반환
          }
        }
      }
    }
    
    // 게시판 하위 메뉴 URL과 일치하는지 확인 (정확한 매칭 우선)
    for (const nav of navItems) {
      if (nav.children && nav.children.length > 0) {
        for (const child of nav.children) {
          if (child.url && currentPath.startsWith('/board') && child.url.startsWith('/board/')) {
            const boardId = currentPath.split('/')[2]
            const childBoardId = child.url.split('/')[2]
            if (boardId === childBoardId) {
              console.log('게시판 하위 메뉴 URL 일치:', child.title, '부모:', nav.title)
              return nav // 부모 메뉴 반환
            }
          }
        }
      }
    }
    
    for (const nav of navItems) {
      console.log('검사 중인 메뉴:', nav.title, nav.url, nav.type)
      
      // 메인 메뉴 URL과 일치하는지 확인
      if (nav.url && currentPath === nav.url) {
        console.log('메인 메뉴 URL 일치:', nav.title)
        return nav
      }
      
      // 상품 관련 페이지인 경우 상품 메뉴 찾기
      if (currentPath.startsWith('/products') && nav.type === 'PRODUCTS') {
        console.log('상품 메뉴 일치:', nav.title)
        return nav
      }
      
      // 게시판 관련 페이지인 경우 게시판 메뉴 찾기 (하위 메뉴가 없는 경우)
      if (currentPath.startsWith('/board') && nav.type === 'BOARD') {
        console.log('게시판 메뉴 일치:', nav.title)
        return nav
      }
      
      // 콘텐츠 관련 페이지인 경우 콘텐츠 메뉴 찾기 (쿼리 파라미터가 없는 경우만)
      if (currentPath.startsWith('/contents') && nav.type === 'CONTENT' && !currentPath.includes('?')) {
        console.log('콘텐츠 메뉴 일치 (쿼리 없음):', nav.title)
        return nav
      }
      
      // 콘텐츠 페이지 URL과 정확히 일치하는 경우
      if (nav.url && currentPath === nav.url && nav.type === 'CONTENT') {
        console.log('콘텐츠 URL 정확 일치:', nav.title)
        return nav
      }
      
      // 콘텐츠 페이지 쿼리 파라미터 매치 (contents 경로일 때만)
      if (currentPath.startsWith('/contents') && nav.url && nav.url.startsWith('/contents?slug=')) {
        const urlParams = new URLSearchParams(nav.url.split('?')[1])
        const currentParams = new URLSearchParams(currentPath.split('?')[1] || '')
        console.log('쿼리 파라미터 비교:', urlParams.get('slug'), currentParams.get('slug'))
        if (urlParams.get('slug') === currentParams.get('slug')) {
          console.log('쿼리 파라미터 일치:', nav.title)
          return nav
        }
      }
      
      // 하위 메뉴에서 컨텐츠 페이지 쿼리 파라미터 매치 (contents 경로일 때만)
      if (currentPath.startsWith('/contents') && nav.children && nav.children.length > 0) {
        for (const child of nav.children) {
          if (child.url && child.url.startsWith('/contents?slug=')) {
            const urlParams = new URLSearchParams(child.url.split('?')[1])
            const currentParams = new URLSearchParams(currentPath.split('?')[1] || '')
            console.log('하위 메뉴 쿼리 파라미터 비교:', urlParams.get('slug'), currentParams.get('slug'))
            if (urlParams.get('slug') === currentParams.get('slug')) {
              console.log('하위 메뉴 쿼리 파라미터 일치:', child.title, '부모:', nav.title)
              return nav // 부모 메뉴 반환
            }
          }
        }
      }
    }
    console.log('일치하는 메뉴를 찾지 못함')
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
          // 게시판 URL 매치 (/board/notice, /board/event)
          if (child.url && child.url.startsWith('/board/') && currentPath.startsWith('/board/')) {
            const boardId = currentPath.split('/')[2]
            const childBoardId = child.url.split('/')[2]
            if (boardId === childBoardId) {
              return child
            }
          }
          // 컨텐츠 페이지 URL 매치 (/contents/slug)
          if (child.url && child.url.startsWith('/contents/') && currentPath.startsWith('/contents/')) {
            if (child.url === currentPath) {
              return child
            }
          }
          // 컨텐츠 페이지 쿼리 파라미터 매치 (/contents?slug=slug) - contents 경로일 때만
          if (currentPath.startsWith('/contents') && child.url && child.url.startsWith('/contents?slug=')) {
            const urlParams = new URLSearchParams(child.url.split('?')[1])
            const currentParams = new URLSearchParams(currentPath.split('?')[1] || '')
            if (urlParams.get('slug') === currentParams.get('slug')) {
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
      let firstChildUrl = menu.children[0].url || '#'
      // contents 경로일 때만 /contents/slug 형태를 /contents?slug=slug 형태로 변환
      if (firstChildUrl.startsWith('/contents/') && !firstChildUrl.includes('?') && menu.type === 'CONTENT') {
        const slug = firstChildUrl.replace('/contents/', '')
        firstChildUrl = `/contents?slug=${slug}`
      }
      window.location.href = firstChildUrl
    } else if (menu.url) {
      // 1차 메뉴에 직접 URL이 있으면 해당 URL로 이동
      let menuUrl = menu.url
      // contents 경로일 때만 /contents/slug 형태를 /contents?slug=slug 형태로 변환
      if (menuUrl.startsWith('/contents/') && !menuUrl.includes('?') && menu.type === 'CONTENT') {
        const slug = menuUrl.replace('/contents/', '')
        menuUrl = `/contents?slug=${slug}`
      }
      window.location.href = menuUrl
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
      let subMenuUrl = subMenu.url
      // contents 경로일 때만 /contents/slug 형태를 /contents?slug=slug 형태로 변환
      if (subMenuUrl.startsWith('/contents/') && !subMenuUrl.includes('?') && subMenu.type === 'CONTENT') {
        const slug = subMenuUrl.replace('/contents/', '')
        subMenuUrl = `/contents?slug=${slug}`
      }
      window.location.href = subMenuUrl
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
  const currentSubMenu = findCurrentSubMenuByPath(fullPath, navigations)
  const isProductsPage = fullPath.startsWith('/products')
  const isContentPage = fullPath.startsWith('/contents')
  const isBoardPage = fullPath.startsWith('/board')
  
  // 컨텐츠 페이지가 1차 메뉴 자체인지 2차 메뉴인지 확인
  const isContentPageAsMainMenu = isContentPage && !currentSubMenu
  const isContentPageAsSubMenu = isContentPage && currentSubMenu
  
  // 게시판 페이지가 1차 메뉴 자체인지 2차 메뉴인지 확인
  const isBoardPageAsMainMenu = isBoardPage && !currentSubMenu
  const isBoardPageAsSubMenu = isBoardPage && currentSubMenu

  return (
    <nav className="bg-white py-5">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex items-center gap-[30px] relative md:gap-[30px] gap-[10px]">
          {/* 홈 버튼 - 데스크톱에서만 표시 */}
          <Link href="/" className="hidden md:flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/images/home-icon.png" 
              alt="홈" 
              className="w-6 h-6" 
            />
          </Link>

          {/* 상품예약 페이지이거나 컨텐츠 페이지, 게시판 페이지가 2차 메뉴인 경우 팝업 기능 포함 */}
          {(isProductsPage && currentSubMenu) || isContentPageAsSubMenu || isBoardPageAsSubMenu ? (
            <>
              {/* 1차 메뉴 - 모바일 50% */}
              <div className="relative w-[50%] md:w-auto">
                <div 
                  className="flex items-center justify-between w-full md:w-[200px] cursor-pointer"
                  onClick={() => {
                    setShowMainMenu(!showMainMenu)
                    setShowSubMenu(false) // 1차 메뉴 클릭시 2차 메뉴 팝업 닫기
                  }}
                >
                  <p className="font-['Pretendard:Medium',_sans-serif] text-[17px] md:text-[17px] text-[14px] text-[#222222] leading-[30px] md:leading-[30px] leading-[20px] truncate">
                    {selectedMainMenu || '메뉴'}
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

              {/* 서브 메뉴 (현재 선택된 메인 메뉴의 하위 메뉴들) - 모바일 50% */}
              {getCurrentMainMenu()?.children && getCurrentMainMenu()!.children.length > 0 && (
                <div className="flex items-center gap-[30px] w-[50%] md:w-auto">
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
          ) : isContentPageAsMainMenu || isBoardPageAsMainMenu ? (
            <>
              {/* 컨텐츠 페이지가 1차 메뉴인 경우 - 팝업 기능 포함 */}
              <div className="relative w-[50%] md:w-auto">
                <div 
                  className="flex items-center justify-between w-full md:w-[200px] cursor-pointer"
                  onClick={() => {
                    setShowMainMenu(!showMainMenu)
                    setShowSubMenu(false) // 1차 메뉴 클릭시 2차 메뉴 팝업 닫기
                  }}
                >
                  <span className="font-['Pretendard:Medium',_sans-serif] text-[17px] md:text-[17px] text-[14px] text-[#222222] leading-[30px] md:leading-[30px] leading-[20px] truncate">
                    {selectedMainMenu || '메뉴'}
                  </span>
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
            </>
          ) : (
            <>
              {/* 메인 메뉴 선택 버튼 - 모바일 50% */}
              <div className="relative w-[50%] md:w-auto">
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

              {/* 서브 메뉴 (현재 선택된 메인 메뉴의 하위 메뉴들) - 모바일 50% */}
              {getCurrentMainMenu()?.children && getCurrentMainMenu()!.children.length > 0 && (
                <div className="flex items-center gap-[30px] w-[50%] md:w-auto">
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

export default function SubNavigation({ items = [] }: SubNavigationProps) {
  return (
    <Suspense fallback={
      <nav className="bg-white py-5">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="flex items-center gap-[30px] relative md:gap-[30px] gap-[10px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </nav>
    }>
      <SubNavigationContent items={items} />
    </Suspense>
  )
}
