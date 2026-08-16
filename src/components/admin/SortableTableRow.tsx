'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

type SortableTableRowProps = {
  id: string;
  disabled?: boolean;
  className?: string;
  handleCellClassName?: string;
  label?: string;
  children: ReactNode;
};

export function SortableTableRow({
  id,
  disabled = false,
  className = '',
  handleCellClassName = 'px-2 py-3 text-center',
  label = '拖曳調整順序',
  children,
}: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    transition: {
      duration: 240,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
  });

  return (
    <tr
      ref={setNodeRef}
      className={`${className} transition-[background-color,box-shadow,opacity] duration-200 ${isDragging ? 'bg-[#FFF8F2] opacity-80 shadow-lg' : ''}`}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 20 : undefined,
        willChange: transform ? 'transform' : undefined,
      }}
    >
      <td className={handleCellClassName}>
        <button
          ref={setActivatorNodeRef}
          type="button"
          disabled={disabled}
          aria-label={label}
          title={disabled ? '目前無法拖曳排序' : label}
          {...attributes}
          {...listeners}
          className={`mx-auto flex h-9 w-9 touch-none items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA7452]/40 ${
            disabled
              ? 'cursor-not-allowed text-gray-300'
              : 'text-[#AA7452] hover:scale-110 hover:bg-[#AA7452]/10 active:scale-95 active:bg-[#AA7452]/15'
          }`}
          style={{
            cursor: disabled
              ? 'not-allowed'
              : "url('/icons/hand-light-cursor.svg') 16 4, grab",
          }}
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      </td>
      {children}
    </tr>
  );
}
