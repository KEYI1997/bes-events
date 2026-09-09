'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { Product } from '@/lib/types';
import { productCatalogPriceText } from '@/lib/productOptions';

interface ServiceProductGridProps {
  products: Product[];
  showDetailCta?: boolean;
}

export default function ServiceProductGrid({ products, showDetailCta = false }: ServiceProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => {
        const imgSrc =
          product.image_url?.split(',')[0]?.trim() ||
          product.image_urls?.[0] ||
          '/images/placeholder.jpg';

        return (
          <AnimateOnScroll key={product.id} delay={index * 100}>
            <Link
              href={`/products/detail/${product.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-lg block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f4ef]">
                <Image
                  src={imgSrc}
                  alt={product.name}
                  fill
                  className="object-contain object-center"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-primary mb-2">{product.name}</h3>
                <div className="flex-1" />
                {productCatalogPriceText(product.description, product.price_note) && (
                  <p
                    className="text-base font-bold leading-relaxed whitespace-pre-line"
                    style={{ color: '#AA7452' }}
                  >
                    {productCatalogPriceText(product.description, product.price_note)}
                  </p>
                )}
                {showDetailCta && <span aria-hidden="true" className="mt-6 inline-flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-cta bg-cta px-5 py-3 text-sm font-bold text-white transition-all duration-300 ease-in-out group-hover:bg-white group-hover:text-cta">
                  <ArrowRight size={16} className="mr-2 shrink-0 translate-x-0 opacity-100 transition-all duration-300 ease-in-out group-hover:-translate-x-4 group-hover:opacity-0" />
                  <span>查看詳情</span>
                  <ArrowRight size={16} className="ml-2 shrink-0 translate-x-4 rotate-180 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:opacity-100" />
                </span>}
              </div>
            </Link>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
