import { useState } from "react";

interface TabItemProps {
  label: string;
  isActive: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onClick: () => void;
}

function TabItem({ label, isActive, isFirst, isLast, onClick }: TabItemProps) {
  const baseClasses = "box-border content-stretch flex gap-[10px] items-center mb-[-1px] px-[20px] py-[10px] relative shrink-0 w-[200px] cursor-pointer transition-colors";
  const activeClasses = isActive 
    ? "bg-[#190a6b]" 
    : "bg-white hover:bg-gray-50";
  
  const roundedClasses = isFirst 
    ? "rounded-tl-[4px] rounded-tr-[4px]" 
    : isLast 
    ? "rounded-bl-[4px] rounded-br-[4px]" 
    : "";

  return (
    <div 
      className={`${baseClasses} ${activeClasses} ${roundedClasses}`}
      onClick={onClick}
    >
      {!isActive && (
        <div 
          aria-hidden="true" 
          className={`absolute border border-[#dddddd] border-solid inset-0 pointer-events-none ${isLast ? 'rounded-bl-[4px] rounded-br-[4px]' : ''}`} 
        />
      )}
      <p className={`font-['Pretendard:Medium',_sans-serif] leading-[30px] not-italic relative shrink-0 text-[16px] text-nowrap whitespace-pre ${isActive ? 'text-white' : 'text-[#222222]'}`}>
        {label}
      </p>
    </div>
  );
}

export default function NavigationMenuTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    "상품예약",
    "단체여행",
    "운항정보",
    "고객센터",
    "회사소개"
  ];

  return (
    <div className="box-border content-stretch flex flex-col items-start pb-px pt-0 px-0 relative">
      {tabs.map((tab, index) => (
        <TabItem
          key={index}
          label={tab}
          isActive={activeTab === index}
          isFirst={index === 0}
          isLast={index === tabs.length - 1}
          onClick={() => setActiveTab(index)}
        />
      ))}
    </div>
  );
}
