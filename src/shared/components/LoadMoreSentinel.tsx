import {
  type ReactElement,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

type Props = {
  /** Called once, as the sentinel nears the view. */
  onMore: () => void;
};

/**
 * The end of a list shown a page at a time. Key it by how much is shown, so a
 * sentinel still in view after a page is a new element and loads the next one.
 */
export function LoadMoreSentinel({ onMore }: Props): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  // The latest, without observing anew on each render of a list.
  const more = useEffectEvent(onMore);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();

          more();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} />;
}

/**
 * `items` a page at a time: `more` goes after the shown ones, and `reset`
 * goes back to the first page.
 */
export function usePaged<T>(items: T[], pageSize: number) {
  const [limit, setLimit] = useState(pageSize);

  return {
    shown: items.slice(0, limit),
    more: items.length > limit && (
      <LoadMoreSentinel
        key={limit}
        onMore={() => setLimit((limit) => limit + pageSize)}
      />
    ),
    reset: () => setLimit(pageSize),
  };
}
