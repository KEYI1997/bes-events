"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CaseImage = {
  src: string;
  alt: string;
};

type EventCaseSmoothSliderProps = {
  images: CaseImage[];
};

const ease = 0.16;

export default function EventCaseSmoothSlider({ images }: EventCaseSmoothSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const targetScroll = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let dragStartX = 0;
    let dragStartScroll = 0;
    let isDragging = false;

    const maxScroll = () => Math.max(0, slider.scrollWidth - slider.clientWidth);
    const clamp = (value: number) => Math.min(maxScroll(), Math.max(0, value));
    const stopAnimation = () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
    const updateActiveSlide = () => {
      const center = slider.scrollLeft + slider.clientWidth / 2;
      const cards = Array.from(slider.querySelectorAll<HTMLElement>("[data-case-slide]"));
      const closest = cards.reduce(
        (nearest, card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(cardCenter - center);
          return distance < nearest.distance ? { index, distance } : nearest;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY },
      );
      setActiveIndex(closest.index);
    };
    const animate = () => {
      const distance = targetScroll.current - slider.scrollLeft;
      if (Math.abs(distance) < 0.5) {
        slider.scrollLeft = targetScroll.current;
        animationFrame.current = null;
        updateActiveSlide();
        return;
      }

      slider.scrollLeft += distance * ease;
      updateActiveSlide();
      animationFrame.current = requestAnimationFrame(animate);
    };
    const startAnimation = () => {
      if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(animate);
    };
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;

      event.preventDefault();
      targetScroll.current = clamp(targetScroll.current + delta * 0.9);
      startAnimation();
    };
    const onPointerDown = (event: PointerEvent) => {
      isDragging = true;
      dragStartX = event.clientX;
      dragStartScroll = targetScroll.current = slider.scrollLeft;
      slider.setPointerCapture(event.pointerId);
      stopAnimation();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      targetScroll.current = clamp(dragStartScroll - (event.clientX - dragStartX));
      slider.scrollLeft = targetScroll.current;
      updateActiveSlide();
    };
    const onPointerUp = (event: PointerEvent) => {
      isDragging = false;
      if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
    };
    const onScroll = () => {
      if (!isDragging && animationFrame.current === null) targetScroll.current = slider.scrollLeft;
      updateActiveSlide();
    };

    targetScroll.current = slider.scrollLeft;
    updateActiveSlide();
    slider.addEventListener("wheel", onWheel, { passive: false });
    slider.addEventListener("pointerdown", onPointerDown);
    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", onPointerUp);
    slider.addEventListener("pointercancel", onPointerUp);
    slider.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stopAnimation();
      slider.removeEventListener("wheel", onWheel);
      slider.removeEventListener("pointerdown", onPointerDown);
      slider.removeEventListener("pointermove", onPointerMove);
      slider.removeEventListener("pointerup", onPointerUp);
      slider.removeEventListener("pointercancel", onPointerUp);
      slider.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={sliderRef}
      data-case-slider
      aria-label="活動案例分享"
      className="event-case-slider -mx-1 overflow-x-auto overscroll-x-contain px-1 pb-4 pt-2 [scrollbar-color:#b58445_transparent] [scrollbar-width:thin]"
    >
      <div className="flex w-max gap-4 px-5 sm:gap-5 sm:px-8 lg:px-12">
        {images.map((image, index) => (
          <figure
            key={image.src}
            data-case-slide
            className={`relative aspect-[3/2] w-[76vw] max-w-[330px] shrink-0 sm:max-w-[360px] lg:max-w-[400px] overflow-hidden rounded-2xl border border-[#e4ded6] bg-[#eee9e2] shadow-[0_12px_34px_rgba(45,38,29,0.1)] transition-[transform,filter,opacity] duration-500 ease-out sm:w-[360px] lg:w-[400px] ${activeIndex === index ? "scale-100 opacity-100 saturate-100" : "scale-[0.95] opacity-70 saturate-[0.82]"}`}
          >
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 360px, 76vw" className="object-cover" draggable={false} />
          </figure>
        ))}
      </div>
    </div>
  );
}