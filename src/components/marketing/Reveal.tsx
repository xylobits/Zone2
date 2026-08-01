'use client';

import { createElement, type ElementType, type ReactNode } from 'react';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

type RevealProps = {
  as?: ElementType;
  delay?: 1 | 2 | 3;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

/** Wraps the source's global `.rv` reveal-on-scroll behavior as a per-instance component. */
export function Reveal({ as = 'div', delay, className = '', children, ...rest }: RevealProps) {
  const { ref, inView } = useRevealOnScroll<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      className: `rv${inView ? ' in' : ''}${className ? ` ${className}` : ''}`,
      'data-d': delay,
      ...rest,
    },
    children,
  );
}
