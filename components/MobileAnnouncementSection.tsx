'use client'

export default function MobileAnnouncementSection() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        {/* 공지사항 아이콘 - 모바일 버전 */}
        <div className="relative shrink-0 size-[30px]">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src="/images/7ee2e80c76ff5461678242b1f2ed1baba366c81d.png" />
        </div>
        <div className="font-['Pretendard:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[20px] text-nowrap">
          <p className="leading-[30px] whitespace-pre">공지사항</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
        {/* 공지사항 목록 - 모바일 버전 */}
        <div className="box-border content-stretch flex flex-col gap-[2px] items-start pb-[10px] pt-0 px-0 relative shrink-0 w-full border-b border-[#dddddd]">
          <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[13px] text-nowrap">
            <p className="leading-[20px] whitespace-pre">2025 여름 불꽃크루즈!! 7월19일부터 매주 토요일</p>
          </div>
          <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[10px] text-nowrap">
            <p className="leading-[18px] whitespace-pre">2025-06-09</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-[2px] items-start pb-[10px] pt-0 px-0 relative shrink-0 w-full border-b border-[#dddddd]">
          <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[13px] text-nowrap">
            <p className="leading-[20px] whitespace-pre">2025년 정기검사 휴항안내</p>
          </div>
          <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[10px] text-nowrap">
            <p className="leading-[18px] whitespace-pre">2025-06-09</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-[2px] items-start pb-[10px] pt-0 px-0 relative shrink-0 w-full border-b border-[#dddddd]">
          <div className="font-['Pretendard:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#222222] text-[13px] text-nowrap">
            <p className="leading-[20px] whitespace-pre">(예고편)덕적도&월미도 유람선_ 찾아가는 국악버</p>
          </div>
          <div className="font-['Pretendard:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#666666] text-[10px] text-nowrap">
            <p className="leading-[18px] whitespace-pre">2025-06-09</p>
          </div>
        </div>
      </div>
    </div>
  )
}
