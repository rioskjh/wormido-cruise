'use client'

// import Image from 'next/image' // 이미지 최적화 비활성화

export default function GroupTravelSection() {
  return (
    <>
      {/* 모바일 버전 */}
      <div className="md:hidden relative rounded-[10px] size-full">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px]">
          <img
            src="/images/554419256e070f67b901bd627c66e2442e2f9b89.png"
            alt="단체여행 배경"
            className="w-full h-full object-cover rounded-[10px]"
          />
          <div className="absolute bg-[rgba(0,0,0,0.2)] inset-0 rounded-[10px]" />
        </div>
        <div className="flex flex-col items-center justify-center overflow-clip size-full">
          <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center px-[20px] py-[42px] relative w-full">
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
              <div className="font-['Pretendard:Bold',_sans-serif] leading-[30px] not-italic relative shrink-0 text-[0px] text-[20px] text-nowrap text-white whitespace-pre">
                <p className="font-['Pretendard:Regular',_sans-serif] mb-0">단체 여행은</p>
                <p>맞춤형 패키지로 편리하게</p>
              </div>
              <div className="box-border content-stretch flex gap-[4px] items-center px-[20px] py-[8px] relative rounded-[4px] shrink-0">
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[4px]" />
                <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[11px] text-center text-nowrap text-white">
                  <p className="leading-[20px] whitespace-pre">단체여행 패키지 보기</p>
                </div>
                <div className="flex h-[12px] items-center justify-center relative shrink-0 w-[12px]">
                  <div className="flex-none rotate-[90deg]">
                    <div className="relative size-[12px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                        <g>
                          <path d="M3 9l3-3 3 3" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱 버전 */}
      <div className="hidden md:block relative rounded-[10px] size-full">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px]">
          <img
            src="/images/554419256e070f67b901bd627c66e2442e2f9b89.png"
            alt="단체여행 배경"
            className="w-full h-full object-cover rounded-[10px]"
          />
          <div className="absolute bg-[rgba(0,0,0,0.2)] inset-0 rounded-[10px]" />
        </div>
        <div className="flex flex-col items-center justify-center size-full">
          <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center overflow-clip px-[100px] py-[140px] relative size-full">
            <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full">
              <div className="font-['Pretendard:Bold',_sans-serif] leading-[60px] not-italic relative shrink-0 text-[0px] text-[40px] text-nowrap text-white whitespace-pre">
                <p className="font-['Pretendard:Regular',_sans-serif] mb-0">단체 여행은</p>
                <p>맞춤형 패키지로 편리하게</p>
              </div>
              <div className="box-border content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[4px] shrink-0 w-[211px]">
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[4px]" />
                <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[17px] text-center text-nowrap text-white">
                  <p className="leading-[30px] whitespace-pre">단체여행 패키지 보기</p>
                </div>
                <div className="flex h-[20px] items-center justify-center relative shrink-0 w-[20px]">
                  <div className="flex-none rotate-[90deg]">
                    <div className="relative size-[20px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                        <g>
                          <path d="M5 15l7-7 7 7" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
