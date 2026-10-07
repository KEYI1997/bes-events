import type { Metadata } from 'next';
import ServiceCategoryPage from '../[category]/page';
import { createPageMetadata } from '@/lib/seo';

const description = '境曜提供台北、新北、桃園與新竹的活動企劃統包服務，整合企劃、視覺、舞台技術、流程控管與現場執行，適合記者會、新品發表會、尾牙春酒及企業活動。';

export const metadata: Metadata = createPageMetadata({
  title: '台北活動企劃統包｜記者會、發表會與企業活動整合',
  description,
  path: '/services/event-package',
  keywords: ['台北活動企劃', '活動企劃統包', '企業活動企劃', '記者會執行', '新品發表會', '境曜有限公司'],
});

export default function EventPackageRoute() {
  return <ServiceCategoryPage params={Promise.resolve({ category: 'event-package' })} />;
}
