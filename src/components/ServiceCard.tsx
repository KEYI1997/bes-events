'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  desc: string;
  href: string;
}

export default function ServiceCard({ title, desc, href }: ServiceCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="relative h-[200px] overflow-hidden cursor-pointer">
        {/* 原始狀態 - 大大的中文字 */}
        <div className="absolute inset-0 flex items-center justify-center bg-white border-b border-gray-200 transition-transform duration-500 ease-out group-hover:-translate-x-full">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-wider">
            {title}
          </h3>
        </div>
        
        {/* Hover 狀態 - 從右滑入的覆蓋層 */}
        <div className="absolute inset-0 flex items-center justify-between px-8 md:px-12 bg-cta translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0">
          <div className="flex-1">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {title}
            </h3>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              {desc}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
            <ArrowRight size={24} className="text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
