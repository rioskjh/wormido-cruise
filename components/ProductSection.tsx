'use client'

import Link from 'next/link'
import Image from 'next/image'

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
    name: string
  }
  images: {
    id: number
    fileName: string
    filePath: string
    sortOrder: number
  }[]
}

interface ProductSectionProps {
  products: Product[]
  loading: boolean
  error: string
}

export default function ProductSection({ products, loading, error }: ProductSectionProps) {
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start pb-[100px] pt-0 px-0 relative size-full">
      {/* 상품소개 제목 */}
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
        {/* 상품소개 아이콘 */}
        <div className="h-[33px] overflow-clip relative shrink-0 w-[66px]">
          <div className="absolute bottom-[17.19%] contents left-0 right-[56.81%] top-[38.28%]">
            <div className="absolute inset-[38.28%_56.81%_22.54%_19.89%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/1a15bbcbe86ba6d2d8330d75f66a8148fe441f81.png" />
              </div>
            </div>
            <div className="absolute bottom-[17.19%] left-0 right-[85.9%] top-[51.77%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/126c3b41b2f5ef7dcb92743e4b07612b9343c994.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[38.28%_56.81%_22.54%_19.89%]">
            <div className="absolute inset-[38.28%_56.81%_22.54%_19.89%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/e5907e1b5a715f977aea07ae5e25b493aeddfde6.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[38.28%_56.81%_15.76%_1.21%]">
            <div className="absolute inset-[38.28%_56.81%_21.12%_18.6%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/9ad1433a9f1c0231ef09a1d589a1b1f3302c5020.png" />
              </div>
            </div>
            <div className="absolute inset-[38.28%_61.74%_15.76%_1.21%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/7cc6c66a0e0288a3d9b3f7e0c5e9d8fb2b7723f5.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[77.79%_56.98%_-0.01%_18.28%]">
            <div className="absolute inset-[77.79%_56.98%_1.76%_31.42%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/ef5a7be33a71a6430a90ad105bd82f3fc2fb2785.png" />
              </div>
            </div>
            <div className="absolute inset-[77.79%_60.12%_0.12%_18.28%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/ce11576de1403d7a121185d99618a35ed2cf52ba.png" />
              </div>
            </div>
            <div className="absolute inset-[96.98%_56.98%_-0.01%_37.3%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/5e6925481fb4c35c53368fba7a22b1465ccd76af.png" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-[4.4%] contents left-[28.91%] right-0 top-[-0.01%]">
            <div className="absolute contents inset-[6.69%_6.49%_11.55%_36.51%]">
              <div className="absolute inset-[6.69%_14.4%_59.33%_36.51%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/52692bc62fd62247373fd24e6c8e25a89921229c.png" />
                </div>
              </div>
              <div className="absolute inset-[48.3%_6.49%_11.55%_47.67%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/2212efd6949f888ec03a200e7ad2019a51653155.png" />
                </div>
              </div>
              <div className="absolute inset-[29.87%_7.69%_45.15%_71.36%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/e1534539da0090726a87766b9536180e2f96bc59.png" />
                </div>
              </div>
            </div>
            <div className="absolute contents inset-[33.06%_17.24%_29.16%_36.54%]">
              <div className="absolute inset-[33.06%_18.95%_29.16%_36.54%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/6fcce2112dbb1217e32c05dc3a508cc1ae7be6c6.png" />
                </div>
              </div>
              <div className="absolute inset-[33.29%_17.24%_45.22%_67.55%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/0279006e5653701283e6e34a07b609333312b52a.png" />
                </div>
              </div>
            </div>
            <div className="absolute contents inset-[3.87%_5.03%_7.88%_50.11%]">
              <div className="absolute inset-[3.87%_5.03%_7.88%_50.11%]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/4c6a6a8cdc011a3b081abe279fd090ce74e56b6e.png" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-[4.4%] left-[28.91%] right-0 top-[-0.01%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/c39e6335981ea85dedf9b8b2fea3c10a8f4388ec.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[61.41%_-0.02%_12.89%_-0.09%]">
            <div className="absolute inset-[61.41%_-0.02%_12.89%_-0.09%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/124957c67163c9992faae5d791090facaefe107b.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[62.06%_61.22%_24.43%_2.57%]">
            <div className="absolute inset-[62.06%_61.22%_24.43%_2.57%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/36fea03644739a343ebc1f129a559f26b5260364.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[79.7%_2.22%_-0.18%_7.47%]">
            <div className="absolute inset-[79.7%_2.22%_-0.18%_7.47%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/67c454d75cb7bc19d58e202f929205aa2eff030a.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[72.95%_1.05%_5.27%_4.17%]">
            <div className="absolute inset-[72.95%_1.05%_5.27%_4.17%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/1ba730d147665a7ff7007bef735e01ed872fc395.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[-0.01%_32.68%_89.99%_45.49%]">
            <div className="absolute inset-[-0.01%_32.68%_89.99%_45.49%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/bb1d6700850b9e848b70547f6f47359227b48663.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[44.2%_4.56%_24.43%_25.04%]">
            <div className="absolute inset-[44.2%_4.56%_24.43%_25.04%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/714581e1d5072c9a04ed2645624d579529b29905.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[8.7%_18.3%_71.26%_30.8%]">
            <div className="absolute inset-[8.7%_18.3%_71.26%_30.8%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/554419256e070f67b901bd627c66e2442e2f9b89.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[26.56%_11.16%_51.44%_27.92%]">
            <div className="absolute inset-[26.56%_11.16%_51.44%_27.92%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/ec35f3ef156b9a8f70f3287075f9d663e753a88b.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[16.32%_8.5%_39.03%_68.39%]">
            <div className="absolute contents inset-[16.76%_28.42%_77.14%_68.39%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/395ecb514347a2b67636818efc42e5bc27269325.png" />
              </div>
            </div>
            <div className="absolute contents inset-[16.32%_21.39%_77.58%_75.31%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/17c94b934fb469c9e8305d4e810a5c1b2eda98b4.png" />
              </div>
            </div>
            <div className="absolute contents inset-[35.71%_28.42%_58.19%_68.39%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/ef5a7be33a71a6430a90ad105bd82f3fc2fb2785.png" />
              </div>
            </div>
            <div className="absolute contents inset-[34.84%_21.39%_59.06%_75.31%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/ce11576de1403d7a121185d99618a35ed2cf52ba.png" />
              </div>
            </div>
            <div className="absolute contents inset-[34.18%_14.68%_59.72%_82.23%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/5e6925481fb4c35c53368fba7a22b1465ccd76af.png" />
              </div>
            </div>
            <div className="absolute contents inset-[54.66%_28.31%_39.03%_68.39%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/52692bc62fd62247373fd24e6c8e25a89921229c.png" />
              </div>
            </div>
            <div className="absolute contents inset-[53.35%_21.39%_40.33%_75.31%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/2212efd6949f888ec03a200e7ad2019a51653155.png" />
              </div>
            </div>
            <div className="absolute contents inset-[52.48%_14.57%_41.64%_82.34%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/e1534539da0090726a87766b9536180e2f96bc59.png" />
              </div>
            </div>
            <div className="absolute contents inset-[51.17%_8.5%_42.73%_88.84%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/6fcce2112dbb1217e32c05dc3a508cc1ae7be6c6.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[10.23%_33.32%_83.24%_31.75%]">
            <div className="absolute contents inset-[10.23%_33.32%_83.24%_31.75%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/0279006e5653701283e6e34a07b609333312b52a.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[27.65%_37.04%_64.07%_28.45%]">
            <div className="absolute contents inset-[27.65%_37.04%_64.07%_28.45%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/4c6a6a8cdc011a3b081abe279fd090ce74e56b6e.png" />
              </div>
            </div>
          </div>
          <div className="absolute contents inset-[44.86%_39.7%_44.25%_25.79%]">
            <div className="absolute contents inset-[44.86%_39.7%_44.25%_25.79%]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src="/images/c39e6335981ea85dedf9b8b2fea3c10a8f4388ec.png" />
              </div>
            </div>
          </div>
        </div>
        <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[34px] text-nowrap">
          <p className="leading-[50px] whitespace-pre">상품소개</p>
        </div>
      </div>

      {/* 상품 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-design-blue"></div>
          <p className="mt-4 text-design-gray-light font-pretendard text-lg">상품을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[10px] text-center font-pretendard">
          {error}
        </div>
      ) : (
        <div className="content-stretch flex gap-[30px] items-start relative shrink-0">
          {products.map((product, index) => {
            // 업로드된 이미지가 있으면 사용, 없으면 기본 이미지 사용
            const hasUploadedImage = product.images && product.images.length > 0
            const imageSrc = hasUploadedImage 
              ? product.images[0].filePath 
              : `/images/395ecb514347a2b67636818efc42e5bc27269325.png`
            
            return (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`}
                className="content-stretch flex flex-col items-center relative shrink-0 w-[380px] hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                {/* 상품 이미지 영역 */}
                <div className="h-[350px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-[380px]">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover rounded-tl-[10px] rounded-tr-[10px]"
                  />
                </div>
              
                {/* 상품 정보 영역 */}
                <div className="relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                  <div aria-hidden="true" className="absolute border border-[#dddddd] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]" />
                  <div className="flex flex-col items-center size-full">
                    <div className="box-border content-stretch flex flex-col gap-[30px] items-center px-[20px] py-[30px] relative w-full">
                      {/* 상품 제목과 설명 */}
                      <div className="content-stretch flex flex-col gap-[10px] items-center leading-[0] not-italic relative shrink-0 text-center text-nowrap">
                        <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[26px]">
                          <p className="leading-[36px] text-nowrap whitespace-pre">{product.name}</p>
                        </div>
                        <div className="font-['Pretendard:Regular',_sans-serif] leading-[30px] relative shrink-0 text-[#444444] text-[18px] whitespace-pre">
                          <p className="mb-0">{product.description || '상품 설명이 없습니다.'}</p>
                        </div>
                      </div>
                      
                      {/* 가격 정보 */}
                      <div className="content-stretch flex gap-[10px] items-center justify-center leading-[0] not-italic relative shrink-0 text-nowrap">
                        <div className="font-['Pretendard:Regular',_sans-serif] relative shrink-0 text-[#666666] text-[17px]">
                          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[28px] line-through text-nowrap whitespace-pre">
                            {product.basePrice.toLocaleString()}원
                          </p>
                        </div>
                        <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[24px]">
                          <p className="leading-[34px] text-nowrap whitespace-pre">
                            {product.adultPrice.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      
                      {/* 예약 버튼 */}
                      <div className="bg-white box-border content-stretch flex gap-[10px] items-center justify-center px-0 py-[10px] relative rounded-[4px] shrink-0 w-full">
                        <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
                        <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[17px] text-center text-nowrap">
                          <p className="leading-[30px] whitespace-pre">예약하기</p>
                        </div>
                        <div className="flex h-[20px] items-center justify-center relative shrink-0 w-[20px]">
                          <div className="flex-none rotate-[90deg]">
                            <div className="relative size-[20px]">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                                <g>
                                  <path d="M5 15l7-7 7 7" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {products.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-design-gray-light font-pretendard text-lg">등록된 상품이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
