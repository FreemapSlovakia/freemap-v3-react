import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDevicePixelRatio } from '@shared/hooks/useDevicePixelRatio.js';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import { Carousel } from 'react-bootstrap';
import { type Loaded, useCached } from '../hooks/useCached.js';
import { getJson } from '../model/article.js';
import {
  type CommonsImage,
  fetchCommonsImages,
  thumbnailUrl,
} from '../model/commons.js';
import classes from './CommonsImages.module.css';

// `.slide a`'s padding in CSS pixels, and the aspect of the frame inside it.
const PADDING = 8;

const FRAME_ASPECT = 3 / 2;

type Props = {
  files: string[];
  category?: string | undefined;
  /** Shown while loading, or where Commons has nothing. */
  fallback?: ReactNode;
};

/** The photos `CommonsImages` shows for these, from the same request. */
export function useCommonsImages(
  files: string[],
  category: string | undefined,
): { key: string | null; loaded: Loaded<CommonsImage[]> } {
  const language = useAppSelector((state) => state.l10n.language);

  const key =
    files.length || category
      ? `commons:${language}:${files.join('|')}#${category ?? ''}`
      : null;

  const loaded = useCached(key, () =>
    fetchCommonsImages(getJson, files, category, language),
  );

  return { key, loaded };
}

/** Commons photos one at a time, each opening its file page and credited. */
export function CommonsImages({
  files,
  category,
  fallback = null,
}: Props): ReactNode {
  const { key, loaded } = useCommonsImages(files, category);

  const dpr = useDevicePixelRatio();

  // Unknown until measured, so no thumbnail is fetched at a guessed size.
  const [width, setWidth] = useState<number>();

  // Back to the first photo for another object's.
  const [position, setPosition] = useState({ key, index: 0 });

  const index = position.key === key ? position.index : 0;

  const measure = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      return;
    }

    const observer = new ResizeObserver(() => setWidth(el.clientWidth));

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const images = loaded.state === 'done' ? loaded.data : [];

  if (!images.length) {
    return fallback;
  }

  const active = Math.min(index, images.length - 1);

  const frame = width === undefined ? undefined : width - PADDING * 2;

  return (
    <div ref={measure}>
      <Carousel
        activeIndex={active}
        onSelect={(i) => setPosition({ key, index: i })}
        interval={null}
        indicators={false}
        controls={images.length > 1}
        className={`rounded overflow-hidden ${classes.carousel}`}
      >
        {images.map((image, i) => (
          <Carousel.Item key={image.title} className={classes.slide}>
            <a href={image.pageUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={
                  frame === undefined
                    ? undefined
                    : thumbnailUrl(
                        image,
                        Math.ceil(
                          Math.min(
                            frame,
                            (frame * image.width) /
                              (image.height * FRAME_ASPECT),
                          ) * dpr,
                        ),
                      )
                }
                alt={image.caption}
                // Hidden slides load only once next to the one shown.
                loading={Math.abs(i - active) <= 1 ? 'eager' : 'lazy'}
              />
            </a>

            <div className={classes.caption}>
              <span>{image.caption}</span>

              {images.length > 1 && (
                <span className="text-nowrap">
                  {i + 1} / {images.length}
                </span>
              )}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Credit image={images[active]!} />

      {/* Ends what the credit covers. */}
      <hr />
    </div>
  );
}

const httpOnly = (url: string | undefined) =>
  url && /^https?:\/\//i.test(url) ? url : undefined;

function OptionalLink({
  href,
  children,
}: {
  href?: string | undefined;
  children: ReactNode;
}) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    children
  );
}

/** The shown photo's author and license, as Commons licenses require. */
function Credit({ image }: { image: CommonsImage }): ReactElement {
  return (
    <div className="small text-body-secondary mt-1 text-break">
      <OptionalLink href={image.pageUrl}>Wikimedia Commons</OptionalLink>

      {image.artist && (
        <>
          {' · '}
          <OptionalLink href={image.artistUrl}>{image.artist}</OptionalLink>
        </>
      )}

      {image.license && (
        <>
          {' · '}
          {/* Commons' own metadata, linked only where it is a web address. */}
          <OptionalLink href={httpOnly(image.licenseUrl)}>
            {image.license}
          </OptionalLink>
        </>
      )}
    </div>
  );
}
