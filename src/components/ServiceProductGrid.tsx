'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { Product } from '@/lib/types';

interface ServiceProductGridProps {
  products: Product[];
}

export default function ServiceProductGrid({ products }: ServiceProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => {
        const imgSrc =
          product.image_urls?.[0] ||
          product.image_url?.split(',')[0] ||
          '/images/placeholder.jpg';

        return (
          <AnimateOnScroll key={product.id} delay={index * 100}>
            <Link
              href={`/products/detail/${product.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-lg block"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imgSrc}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-primary mb-2">{product.name}</h3>
                <div className="flex-1" />
                {product.price_note && (
                  <p
                    className="text-base font-bold leading-relaxed whitespace-pre-line"
                    style={{ color: '#AA7452' }}
                  >
                    {product.price_note.replace(/\s*[/／]\s*/g, '\n')}
                  </p>
                )}
              </div>
            </Link>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
