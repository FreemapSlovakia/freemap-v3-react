import { useRef } from 'react';

const elements = new Set<HTMLDivElement>();

function update() {
  for (const target of elements) {
    const left = target.getBoundingClientRect().left;

    const removeMargin = left > 40;
    const expectedMargin = removeMargin ? '0' : '';

    // Use appropriate inline margin property
    if (target.style.marginInlineStart !== expectedMargin) {
      target.style.marginInlineStart = expectedMargin;
    }
  }

  requestAnimationFrame(update);
}

requestAnimationFrame(update);

export function useLeftMarginAdjuster() {
  const el = useRef<HTMLDivElement>(null);

  return (element: HTMLDivElement | null) => {
    if (element) {
      el.current = element;

      elements.add(element);
    } else if (el.current) {
      elements.delete(el.current);

      el.current = null;
    }
  };
}
