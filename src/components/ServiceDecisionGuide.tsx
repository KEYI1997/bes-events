import Link from 'next/link';
import type { ReactNode } from 'react';

type DecisionContent = {
  title: string;
  intro: string;
  occasions: string[];
  pricing: string;
  choose: string[];
  confirm: string[];
};

const DECISIONS: Record<string, DecisionContent> = {
  'opening-ceremony': {
    title: '如何挑選啟動儀式與活動道具',
    intro: '從啟動方式、舞台畫面到賓客參與程度，依活動目的挑選適合的儀式道具。',
    occasions: ['開幕典禮', '記者會', '新品發表', '周年慶', '企業典禮', '商場活動'],
    pricing: '商品頁列出的方案與價格為基本服務內容；尺寸、品牌客製、運送、樓層搬運、安裝撤場與現場控師，會依活動條件確認後列入正式報價。',
    choose: ['需要多人共同完成儀式，可優先選擇多人操作型道具。', '希望品牌亮相更具記憶點，可選擇可客製文字、Logo 或主視覺的方案。', '流程時間較短或場地有限時，建議優先評估操作步驟簡潔的道具。'],
    confirm: ['活動日期、地址與進撤場時段', '舞台尺寸、樓層／貨梯與電力條件', '參與貴賓人數與品牌客製檔案'],
  },
  'ai-interactive-props': {
    title: '如何規劃 AI 互動體驗',
    intro: '先釐清活動是要增加人流停留、提升品牌記憶，還是蒐集互動名單，再安排合適的互動形式。',
    occasions: ['展覽活動', '商場快閃', '品牌互動', '校園活動', '企業家庭日'],
    pricing: '費用會依互動形式、設備數量、使用時數、客製畫面、網路環境、螢幕或投影與現場人員需求調整；未標示固定價格的內容會在確認需求後報價。',
    choose: ['想增加停留與參與，可安排即時產生內容或可帶走成果的互動。', '想強化品牌辨識，可加入活動主視覺、品牌框或客製輸出。', '若需蒐集名單，應在規劃初期確認表單、QR Code 與個資告知流程。'],
    confirm: ['預估人流與活動時段', '場地網路、螢幕／投影與電力', '是否需要品牌客製與資料蒐集'],
  },
  'special-effects': {
    title: '如何安排活動特效',
    intro: '特效需配合流程、場地限制與安全距離規劃，才能在正確時間點創造最好的舞台效果。',
    occasions: ['開場倒數', '頒獎典禮', '表演橋段', '品牌亮相', '婚禮進場', '晚宴活動'],
    pricing: '費用依特效類型、設備數量、施放次數、耗材、技術人員、場地安全規範與進撤場條件而定；商品頁固定方案以外的安排，將於確認後報價。',
    choose: ['頒獎或品牌亮相可評估冷焰火、彩帶或舞台特效。', '室內活動可依挑高與流程搭配低煙、泡泡或視覺效果。', '戶外大型活動需優先確認風向、天候、電力與安全距離。'],
    confirm: ['室內／戶外、舞台圖與挑高', '電力、消防規範與場地方限制', '施放時間點、彩排與進撤場安排'],
  },
  'event-package': {
    title: '活動統包如何評估預算與範圍',
    intro: '先確認活動目標與必須完成的內容，再由企劃、設計、設備、人員與現場執行整合成可落地的方案。',
    occasions: ['企業發表會', '品牌活動', '開幕典禮', '記者會', '春酒尾牙', '論壇展演'],
    pricing: '統包費用會依企劃範圍、視覺設計、場地、設備、人員、流程、執行天數與客製內容規劃；確認活動輪廓後提供正式報價。',
    choose: ['需要統一窗口與整體時程控管，適合由活動統包執行。', '已有主視覺或合作廠商，也可只整合需要補足的企劃、設備或現場執行。', '預算尚未定案時，建議先區分必要項目與可升級項目。'],
    confirm: ['活動目標、對象、人數與預算範圍', '活動日期、地點與既有合作項目', '必須呈現的流程、視覺或品牌訊息'],
  },
  bartending: {
    title: '外派調酒方案怎麼選',
    intro: '依賓客人數、服務時段與活動氣氛選擇杯數方案，再確認是否需要客製酒單與吧台配置。',
    occasions: ['企業晚宴', '品牌發表', '婚禮', '派對', 'VIP 接待', '展覽開幕'],
    pricing: '商品頁的杯數方案為基本參考；調酒師人數、服務時數、客製酒單、吧台設備、運送、冰塊、水電與場地方條件，將依實際需求確認。',
    choose: ['賓客人數明確時，可先依杯數方案快速規劃。', '需要品牌體驗時，可規劃酒名、品牌色或無酒精飲品。', '場地限制較多時，應先確認吧台位置、取水、電力、冰塊與垃圾處理。'],
    confirm: ['預估賓客、飲酒比例與服務時段', '酒精／無酒精需求與客製內容', '吧台位置、水電、冰塊及場地方規範'],
  },
  showgirl: {
    title: '活動人員派遣怎麼安排',
    intro: '先界定現場工作內容、服務時段與品牌形象需求，才能安排合適的人數與執行方式。',
    occasions: ['展場接待', '品牌宣傳', '產品展示', '舞台活動', '開幕活動', '晚宴引導'],
    pricing: '費用依人數、服務時數、服裝需求、工作內容、排練、交通與活動地點而定；需求確認後提供正式報價。',
    choose: ['接待、引導、產品展示與舞台互動的工作內容應分別明確列出。', '若有服裝、語言、身高或形象需求，建議在詢價時一併提出。', '需要多人輪班或長時段服務時，應預留交接與休息安排。'],
    confirm: ['工作內容、人數與服務時段', '服裝、語言與品牌形象需求', '集合地點、彩排與交通安排'],
  },
};

export default function ServiceDecisionGuide({ category }: { category: string }) {
  const content = DECISIONS[category];
  if (!content) return null;

  return (
    <section className="border-t border-[#e2ded8] bg-[#f7f4ef] py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 md:px-12">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#252b3a] md:text-4xl">{content.title}</h2>
          <p className="mt-4 text-base leading-8 text-[#555961] md:text-lg">{content.intro}</p>
        </div>
        <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          <DecisionBlock title="適用場合"><div className="flex flex-wrap gap-2">{content.occasions.map(item => <span key={item} className="rounded-full border border-[#d7c5ae] bg-white px-3 py-1.5 text-sm text-[#65543f]">{item}</span>)}</div></DecisionBlock>
          <DecisionBlock title="方案與費用怎麼看"><p>{content.pricing}</p></DecisionBlock>
          <DecisionBlock title="選擇建議"><List items={content.choose} /></DecisionBlock>
          <DecisionBlock title="詢價前請準備"><List items={content.confirm} /></DecisionBlock>
        </div>
        <div className="mt-12 border-t border-[#ddd5ca] pt-8">
          <h3 className="text-xl font-semibold text-[#252b3a]">北部活動服務範圍</h3>
          <p className="mt-3 max-w-4xl text-base leading-8 text-[#555961]">境曜以台北、新北、桃園與新竹為主要服務範圍，提供活動企劃、啟動儀式、活動道具、特效設備、燈光音響舞台、外派調酒及活動人員服務。其他縣市可依活動日期、設備、人員與物流條件個別評估。</p>
          <Link href="/service-areas" className="mt-5 inline-flex text-sm font-semibold text-[#8f633b] underline decoration-[#c5a071] underline-offset-4 transition-colors hover:text-[#654528]">查看服務地區與報價確認方式 →</Link>
        </div>
      </div>
    </section>
  );
}

function DecisionBlock({ title, children }: { title: string; children: ReactNode }) {
  return <div className="border-t border-[#d8cdbd] pt-5"><h3 className="text-lg font-semibold text-[#303642]">{title}</h3><div className="mt-3 text-[15px] leading-7 text-[#5b5e65]">{children}</div></div>;
}

function List({ items }: { items: string[] }) {
  return <ul className="space-y-2.5">{items.map(item => <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b58445]" />{item}</li>)}</ul>;
}
