'use client'

export default function MobileCustomerServiceSection() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        {/* 고객센터 아이콘 - 모바일 버전 */}
        <div className="h-[26px] relative shrink-0 w-[30px]">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/1fa5765c4779a9313c292915da45c9fb833e327f.png" />
        </div>
        <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[20px] text-nowrap">
          <p className="leading-[30px] whitespace-pre">도와드릴까요?</p>
        </div>
      </div>
      <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
          <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic relative shrink-0 text-nowrap">
            <div className="font-['Pretendard:Bold',_sans-serif] relative shrink-0 text-[#222222] text-[24px]">
              <p className="leading-[32px] text-nowrap whitespace-pre">032-765-1171</p>
            </div>
            <div className="font-['Pretendard:Medium',_sans-serif] leading-[19px] relative shrink-0 text-[#666666] text-[11px] whitespace-pre">
              <p className="mb-0">평일 · 주말 09시~18시 (연중무휴)</p>
              <p>전화문의 주시면 정성껏 답변해드립니다.</p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[6px] items-start justify-center relative shrink-0">
          {/* 자주 묻는 질문 버튼 - 모바일 버전 */}
          <div className="bg-white box-border content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[4px] shrink-0 w-[125px]">
            <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
            <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[11px] text-center text-nowrap">
              <p className="leading-[20px] whitespace-pre">자주 묻는 질문</p>
            </div>
            <div className="flex h-[12px] items-center justify-center relative shrink-0 w-[12px]">
              <div className="flex-none rotate-[90deg]">
                <div className="relative size-[12px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                    <g>
                      <path d="M3 9l3-3 3 3" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* 고객센터 버튼 - 모바일 버전 */}
          <div className="bg-white box-border content-stretch flex items-center justify-between px-[20px] py-[10px] relative rounded-[4px] shrink-0 w-[125px]">
            <div aria-hidden="true" className="absolute border border-[#222222] border-solid inset-0 pointer-events-none rounded-[4px]" />
            <div className="font-['Pretendard:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[11px] text-center text-nowrap">
              <p className="leading-[20px] whitespace-pre">고객센터</p>
            </div>
            <div className="flex h-[12px] items-center justify-center relative shrink-0 w-[12px]">
              <div className="flex-none rotate-[90deg]">
                <div className="relative size-[12px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                    <g>
                      <path d="M3 9l3-3 3 3" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
