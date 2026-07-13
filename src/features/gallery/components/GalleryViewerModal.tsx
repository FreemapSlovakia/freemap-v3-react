import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppMenuButton } from '@features/openInExternalApp/components/OpenInExternalAppMenuButton.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { UserChip } from '@shared/components/UserChip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import 'pannellum';
import 'pannellum/build/pannellum.css';
import { hasRole } from '@features/auth/model/types.js';
import {
  type ChangeEvent,
  Fragment,
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Badge,
  Button,
  Form,
  InputGroup,
  Modal,
  Spinner,
} from 'react-bootstrap';
import {
  FaCamera,
  FaExternalLinkAlt,
  FaGem,
  FaImage,
  FaPencilAlt,
  FaRegDotCircle,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { RiFullscreenLine } from 'react-icons/ri';
import { SiWikimediacommons } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import { Rating } from 'react-simple-star-rating';
import { getPhotoLicense, LicenseBadge } from '../licenses.js';
import {
  galleryClear,
  galleryDeletePicture,
  galleryEditPicture,
  galleryQuickAddTag,
  galleryQuickChangePremium,
  galleryRequestImage,
  gallerySavePicture,
  gallerySetComment,
  gallerySetEditModel,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
  gallerySubmitComment,
  gallerySubmitStars,
} from '../model/actions.js';
import { pictureIdToPath } from '../pictureIdPath.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import {
  fetchWikimediaMeta,
  type WikimediaMeta,
  wikimediaImageUrl,
} from '../wikimediaMeta.js';
import { Azimuth } from './Azimuth.js';
import { GalleryEditForm, type PictureModel } from './GalleryEditForm.js';
import { RecentTags } from './RecentTags.js';
import './gallery.css';
import clsx from 'clsx';
import classes from './GalleryViewerModal.module.css';

type Props = { show: boolean };

/**
 * Commons `DateTimeOriginal` is free-form — usually ISO `YYYY-MM-DD`, sometimes
 * raw EXIF `YYYY:MM:DD HH:MM:SS`, sometimes a range ("between 2024 and 2026")
 * that won't match. Parse the leading date (and optional time) by component
 * into a local Date, so date-only and datetime values are consistent (no
 * UTC-vs-local off-by-one) and independent of engine string-parsing quirks.
 * Returns null when it isn't a recognizable date so the caller can show it
 * verbatim.
 */
function parseCommonsDate(value: string | undefined): Date | null {
  const m = value?.match(
    /^(\d{4})[:-](\d{2})[:-](\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );

  if (!m) {
    return null;
  }

  const [, y, mo, d, h, mi, s] = m;

  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h ?? 0),
    Number(mi ?? 0),
    Number(s ?? 0),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

// Cap on cached Commons metadata entries — plenty for instant neighbour
// navigation while bounding memory over a long browsing session.
const COMMONS_CACHE_MAX = 300;

// Max width requested for the windowed (non-fullscreen) Commons image. Snapping
// to the 1920 bucket keeps hi-dpi modals off the heavy, cold-render-prone 3840
// one; fullscreen still rescales up to 3840.
const WINDOWED_MAX_WIDTH = 1920;

/** Insert into the Commons metadata cache, evicting the oldest entries past the
 *  cap (Map keeps insertion order, so the oldest key is always first). */
function cachePut(
  cache: Map<string, WikimediaMeta | 'error'>,
  key: string,
  value: WikimediaMeta | 'error',
): void {
  cache.delete(key); // re-insert to refresh recency
  cache.set(key, value);

  while (cache.size > COMMONS_CACHE_MAX) {
    const oldest = cache.keys().next().value;

    if (oldest === undefined) {
      break;
    }

    cache.delete(oldest);
  }
}

export default function GalleryViewerModal({ show }: Props): ReactElement {
  const m = useMessages();

  const prm = usePremiumMessages();

  const gm = useGalleryMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const imageIds = useAppSelector((state) => state.gallery.imageIds);

  const image = useAppSelector((state) => state.gallery.image);

  const language = useAppSelector((state) => state.l10n.language);

  // Cache of Commons metadata keyed by `language/pageId`, so navigating to a
  // prefetched neighbour is instant. `'error'` marks a failed fetch; keying by
  // language means switching language just misses the stale entries.
  const commonsCache = useRef(new Map<string, WikimediaMeta | 'error'>());

  // Bumped when a Commons fetch lands in the cache, to re-render off the ref.
  const [, forceCommons] = useReducer((x: number) => x + 1, 0);

  const reduxActiveImageId = useAppSelector(
    (state) => state.gallery.activeImageId,
  );

  const comment = useAppSelector((state) => state.gallery.comment);

  const editModel = useAppSelector((state) => state.gallery.editModel);

  const saveErrors = useAppSelector((state) => state.gallery.saveErrors);

  const user = useAppSelector((state) => state.auth.user);

  const allTags = useAppSelector((state) => state.gallery.tags);

  const [loading, setLoading] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [imgKey, setImgKey] = useState(0);

  const [activeImageId, setActiveImageId] = useState<number | null>(null);

  const fullscreenElement = useRef<HTMLDivElement | null>(null);

  const becomePremium = useBecomePremium();

  if (reduxActiveImageId !== activeImageId) {
    setLoading(true);

    setActiveImageId(reduxActiveImageId);
  }

  // Wikimedia photos have a negative id (internal `-pageId`). Deriving this from
  // the id — not `image.source` — means we know it's a Commons photo before its
  // picture record loads, so we never point <img> at our own server for it (a
  // 404 that would flash a broken image instead of the spinner).
  const isWikimedia = activeImageId !== null && activeImageId < 0;

  // Commons pageId of the current Wikimedia photo (id = -pageId), or null.
  const wmPageId = isWikimedia ? -activeImageId : null;

  // Metadata is read from the cache during render, keyed on the id alone — so a
  // prefetched neighbour is shown instantly, without waiting for the Redux
  // picture record to load. The effect below fills the cache and re-renders for
  // ids not yet cached.
  const commonsEntry =
    wmPageId === null
      ? undefined
      : commonsCache.current.get(`${language}/${wmPageId}`);

  const commonsMeta =
    commonsEntry && commonsEntry !== 'error' ? commonsEntry : null;

  // Whether the current Wikimedia photo's image/metadata failed to load — so we
  // can show an error instead of an endless spinner.
  const commonsError = commonsEntry === 'error';

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === fullscreenElement.current);

      setImgKey((imgKey) => imgKey + 1);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleEditModelChange = useCallback(
    (editModel: PictureModel) => {
      dispatch(gallerySetEditModel(editModel));
    },
    [dispatch],
  );

  const handleIndexChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (imageIds) {
        const idx = parseInt(e.currentTarget.value, 10);

        if (Number.isNaN(idx)) {
          throw new Error();
        }

        dispatch(galleryRequestImage(imageIds[idx]));
      }
    },
    [dispatch, imageIds],
  );

  const handleCommentFormSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      dispatch(gallerySubmitComment());
    },
    [dispatch],
  );

  const {
    title = '...',
    description,
    createdAt,
    takenAt,
    tags,
    comments,
    rating,
    myStars,
    lat,
    lon,
    azimuth,
  } = image ?? {};

  // Wikimedia photos carry no server-side title/description; they come from the
  // Commons API fetch instead.
  const displayTitle = isWikimedia ? commonsMeta?.title : title;

  const displayDescription = isWikimedia
    ? commonsMeta?.description
    : description;

  const photoLicense = getPhotoLicense(image?.license);

  // "Captured on": our photos carry a real Date; Commons gives a free-form
  // string we parse when we can, else show verbatim.
  const capturedDate = isWikimedia
    ? parseCommonsDate(commonsMeta?.dateTime)
    : (takenAt ?? null);

  const capturedRaw =
    isWikimedia && !capturedDate ? commonsMeta?.dateTime : undefined;

  // License badge: our photos always map onto our set; Commons photos only when
  // their license does (by CC components). The displayed name and link use the
  // real (possibly older-version) Commons values.
  const badgeLicense = isWikimedia
    ? commonsMeta?.freemapLicense
    : photoLicense.id;

  const licenseName = isWikimedia
    ? commonsMeta?.license
    : gm?.license.names[photoLicense.id];

  const licenseUrl = isWikimedia ? commonsMeta?.licenseUrl : photoLicense.url;

  const premium = Boolean(image?.premium);

  const disabledPremium =
    premium && !isPremium(user) && user?.id !== image?.user?.id;

  // Own photos carry the pano flag server-side; Commons 360s have no GPano/XMP,
  // so they're detected from their exact 2:1 dimensions in the fetched metadata.
  // Gating the Wikimedia case on `commonsMeta` also stops a stale previous
  // record from hijacking the render into the pannellum branch (blank canvas)
  // while a Commons photo's metadata loads.
  const pano = isWikimedia ? Boolean(commonsMeta?.pano) : Boolean(image?.pano);

  // The equirectangular image pannellum renders: our own image endpoint, or a
  // width-capped Commons thumbnail (from wikimediaMeta) for a Wikimedia pano.
  const panoUrl = isWikimedia
    ? commonsMeta?.panoUrl
    : `${process.env['API_URL']}/gallery/pictures/${activeImageId}/image`;

  const p = activeImageId !== null && pano && Boolean(panoUrl);

  const panoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!p || !panoRef.current || !panoUrl) {
      return;
    }

    const v = window.pannellum.viewer(panoRef.current, {
      panorama: panoUrl,
      type: 'equirectangular',
      autoLoad: true,
      showControls: false,
      autoRotate: 15,
      autoRotateInactivityDelay: 60000,
    });

    return () => {
      v.destroy();
    };
  }, [p, panoUrl]);

  const handleFullscreen = useCallback(() => {
    if (!document.exitFullscreen || !fullscreenElement.current) {
      // unsupported
    } else if (document.fullscreenElement === fullscreenElement.current) {
      document.exitFullscreen();
    } else {
      fullscreenElement.current.requestFullscreen();
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (
      await confirm({
        title: gm?.viewer.deleteTitle,
        message: gm?.viewer.deletePrompt(image?.title),
        confirmLabel: m?.general.delete,
        confirmStyle: 'danger',
      })
    ) {
      dispatch(galleryDeletePicture());
    }
  }, [dispatch, confirm, m, gm, image?.title]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        (e.target instanceof HTMLElement &&
          ['input', 'select', 'textarea'].includes(
            e.target.tagName.toLowerCase(),
          )) ||
        e.shiftKey ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey
      ) {
        // nothing
      } else if (e.code === 'KeyF') {
        handleFullscreen();
      } else if (e.code === 'Delete') {
        handleDelete();
      }
    }

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [handleDelete, handleFullscreen]);

  // fullscreen of pano fails when traversing from non-pano picture
  useEffect(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  const loadCommons = useCallback(
    async (
      pageId: number,
      signal?: AbortSignal,
    ): Promise<WikimediaMeta | null> => {
      const key = `${language}/${pageId}`;

      const cached = commonsCache.current.get(key);

      if (cached) {
        return cached === 'error' ? null : cached;
      }

      // Fetch the base thumbnail at the windowed modal size (not the full
      // window): it's what the modal shows by default and what gets prefetched,
      // and the viewer rescales it up per render for fullscreen. Capped at 1920
      // (a common, fast bucket) so hi-dpi windows don't pull the heavy 3840 one
      // — fullscreen still rescales up to it. Commons rounds up to a bucket.
      const width = Math.min(
        WINDOWED_MAX_WIDTH,
        Math.round(
          (window.devicePixelRatio || 1) *
            (window.matchMedia('(min-width: 1200px)').matches
              ? 1110
              : window.matchMedia('(min-width: 992px)').matches
                ? 770
                : 470),
        ),
      );

      const meta = await fetchWikimediaMeta(
        pageId,
        language,
        width,
        signal,
      ).catch(() => null);

      if (!signal?.aborted) {
        cachePut(commonsCache.current, key, meta?.imageUrl ? meta : 'error');
      }

      return meta?.imageUrl ? meta : null;
    },
    [language],
  );

  // For a Wikimedia photo not yet cached, fetch its Commons image + attribution
  // straight from the Commons API into the cache and re-render. Keyed on the id
  // (not the loaded picture record), so it starts as soon as the photo is opened
  // and a prefetched neighbour is already present (rendered instantly above).
  useEffect(() => {
    if (
      wmPageId === null ||
      commonsCache.current.has(`${language}/${wmPageId}`)
    ) {
      return;
    }

    const controller = new AbortController();

    loadCommons(wmPageId, controller.signal).then(() => {
      if (!controller.signal.aborted) {
        forceCommons();
      }
    });

    return () => controller.abort();
  }, [wmPageId, language, loadCommons]);

  const handleSave = useCallback(
    (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(gallerySavePicture());
    },
    [dispatch],
  );

  const index =
    imageIds && activeImageId !== null ? imageIds.indexOf(activeImageId) : -1;

  const nextImageId = imageIds?.[index + 1];

  const prevImageId = index > 0 ? imageIds?.[index - 1] : null;

  // Prefetch neighbouring Wikimedia photos (metadata + image) so next/prev is
  // instant — mirroring the hidden-<img> prefetch used for gallery photos below.
  useEffect(() => {
    const controller = new AbortController();

    for (const nid of [nextImageId, prevImageId]) {
      if (nid != null && nid < 0) {
        loadCommons(-nid, controller.signal).then((meta) => {
          if (meta?.imageUrl && !controller.signal.aborted) {
            new Image().src = meta.imageUrl;
          }
        });
      }
    }

    return () => controller.abort();
  }, [nextImageId, prevImageId, loadCommons]);

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Device-pixel width of the displayed image: the modal's CSS width by
  // breakpoint (or the full window in fullscreen) times the pixel ratio.
  // Recomputed per render, so toggling fullscreen (which also bumps `imgKey`)
  // re-derives a larger size.
  const displayPixelWidth = () =>
    Math.round(
      window.devicePixelRatio *
        (isFullscreen
          ? window.innerWidth
          : window.matchMedia('(min-width: 1200px)').matches
            ? 1110
            : window.matchMedia('(min-width: 992px)').matches
              ? 770
              : 470),
    );

  const getImageUrl = (id: number) =>
    `${process.env['API_URL']}/gallery/pictures/${pictureIdToPath(id)}/image?width=${displayPixelWidth()}` +
    (user ? `&authToken=${encodeURIComponent(user.authToken)}` : '');

  // The displayed image: gallery photos stream from our server; Wikimedia photos
  // come straight from Commons (once their metadata has loaded).
  const mainImageSrc =
    activeImageId === null
      ? undefined
      : isWikimedia
        ? commonsMeta
          ? wikimediaImageUrl(
              commonsMeta,
              isFullscreen
                ? displayPixelWidth()
                : Math.min(displayPixelWidth(), WINDOWED_MAX_WIDTH),
            )
          : undefined
        : getImageUrl(activeImageId);

  const handlePositionPick = useCallback(() => {
    dispatch(gallerySetItemForPositionPicking(-1));
  }, [dispatch]);

  const handleStarsChange = useCallback(
    (stars: number) => {
      dispatch(gallerySubmitStars(stars));
    },
    [dispatch],
  );

  const handlePremiumChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(galleryQuickChangePremium(e.currentTarget.checked));
    },
    [dispatch],
  );

  const close = useCallback(() => {
    dispatch(galleryClear());
  }, [dispatch]);

  // Wikimedia photos are read-only here (no local edit/delete/tags).
  const canEdit = Boolean(
    image &&
      !isWikimedia &&
      (hasRole(user, 'galleryModerator') || user?.id === image.user?.id),
  );

  const handleTagAdd = (tag: string) => {
    dispatch(galleryQuickAddTag(tag));
  };

  // Fallback Commons file-page link derived from the active pageId (id =
  // -pageId), for when the metadata's descriptionUrl hasn't loaded yet (e.g.
  // first open) — so the link is never empty.
  const commonsPageUrl =
    isWikimedia && activeImageId !== null
      ? `https://commons.wikimedia.org/?curid=${-activeImageId}`
      : undefined;

  // "Open in external app" points at the Commons file page for Wikimedia photos,
  // and at the raw image for gallery photos.
  let url = isWikimedia
    ? (commonsMeta?.descriptionUrl ?? commonsPageUrl ?? '')
    : `${process.env['API_URL']}/gallery/pictures/${pictureIdToPath(activeImageId ?? 0)}/image`;

  if (!isWikimedia && activeImageId === image?.id && image.hmac) {
    url += `?hmac=${encodeURIComponent(image.hmac)}`;
  }

  const statusOverlay = commonsError ? (
    <div className="text-center text-body-secondary">
      <FaImage size={48} className="opacity-50" />
      <div>{gm?.viewer.imageUnavailable}</div>
    </div>
  ) : (
    <Spinner animation="border" role="status" variant="primary" />
  );

  return (
    <Modal
      show={show}
      onHide={close}
      size="xl"
      keyboard={false}
      contentClassName="bg-body-tertiary"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera /> {gm?.viewer.title}{' '}
          {imageIds && (
            <Form.Select
              value={index}
              onChange={handleIndexChange}
              className="w-auto d-inline-block"
              disabled={Boolean(editModel)}
            >
              {imageIds.map((_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </Form.Select>
          )}
          {imageIds ? ` / ${imageIds.length} ` : ''}
          {displayTitle && `- ${displayTitle}`}
          {premium && (
            <>
              {' '}
              <FaGem className="text-info" />
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          ref={fullscreenElement}
          className={clsx(isFullscreen && 'fullscreen')}
        >
          <div className="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                {activeImageId === null ? null : pano ? (
                  <div
                    ref={panoRef}
                    key={`pano-${activeImageId}`}
                    id={String(activeImageId)}
                    style={
                      isFullscreen
                        ? { width: '100dvw', height: '100dvh' }
                        : {
                            height: `${Math.max(window.innerHeight - 400, 300)}px`,
                            width: `${
                              window.matchMedia('(min-width: 1200px)').matches
                                ? 1110
                                : window.matchMedia('(min-width: 992px)')
                                      .matches
                                  ? 770
                                  : 470
                            }px`,
                          }
                    }
                  />
                ) : disabledPremium ? (
                  <Alert variant="warning" className="text-center mb-0">
                    {gm?.viewer.premiumOnly}

                    {becomePremium && (
                      <>
                        <br />
                        <Button onClick={becomePremium} className="mt-3">
                          <FaGem /> {prm?.becomePremium}
                        </Button>
                      </>
                    )}
                  </Alert>
                ) : mainImageSrc ? (
                  <div
                    className={clsx(
                      classes.imageContainer,
                      'position-relative',
                    )}
                    // While loading, the <img> has no intrinsic size yet, so the
                    // fit-content container would collapse to 0 and hide the
                    // centered spinner overlay (margin:auto still centers the
                    // 0-width box, so a min-height is enough to reveal it).
                    style={
                      loading ? { minHeight: 'min(60vh, 400px)' } : undefined
                    }
                  >
                    <img
                      key={imgKey}
                      className={clsx('gallery-image', loading && 'loading')}
                      src={mainImageSrc}
                      alt={displayTitle ?? undefined}
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setLoading(false);

                        if (wmPageId !== null) {
                          // Mark this Commons photo failed so we show
                          // "unavailable" instead of a perpetual spinner; the
                          // derived commonsError picks it up.
                          cachePut(
                            commonsCache.current,
                            `${language}/${wmPageId}`,
                            'error',
                          );

                          forceCommons();
                        }
                      }}
                    />

                    {(loading || commonsError) && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        {statusOverlay}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ minHeight: 'min(60vh, 400px)' }}
                  >
                    {statusOverlay}
                  </div>
                )}

                {/* Preload neighbours (own-gallery only — a Wikimedia neighbour's
                    URL isn't known until its Commons metadata is fetched). */}
                {nextImageId != null && nextImageId >= 0 && !loading && (
                  <img
                    key={`next-${imgKey}`}
                    className="d-none"
                    src={getImageUrl(nextImageId)}
                    alt="next"
                  />
                )}

                {prevImageId != null && prevImageId >= 0 && !loading && (
                  <img
                    key={`prev-${imgKey}`}
                    className="d-none"
                    src={getImageUrl(prevImageId)}
                    alt="prev"
                  />
                )}
              </div>
            </div>

            {imageIds && (
              <button
                type="button"
                disabled={Boolean(editModel)}
                className={clsx(
                  'carousel-control-prev',
                  (editModel || index < 1) && 'carousel-control-disabled',
                  pano && 'carousel-control-short',
                )}
                onClick={() => dispatch(galleryRequestImage('prev'))}
              >
                <span className="carousel-control-prev-icon" />
              </button>
            )}

            {imageIds && (
              <button
                type="button"
                disabled={Boolean(editModel)}
                className={clsx(
                  'carousel-control-next',
                  (editModel || index >= imageIds.length - 1) &&
                    'carousel-control-disabled',
                )}
                onClick={() => dispatch(galleryRequestImage('next'))}
              >
                <span className="carousel-control-next-icon" />
              </button>
            )}
          </div>

          {image && (
            <div className={clsx(classes.footer, 'mt-3')}>
              {isFullscreen && imageIds && (
                <>{`${index + 1} / ${imageIds.length}`} ｜ </>
              )}

              {isFullscreen && displayTitle && <>{displayTitle} ｜ </>}

              {isWikimedia ? (
                <>
                  {commonsMeta?.artist && (
                    <>
                      {commonsMeta.artistUrl ? (
                        <a
                          href={commonsMeta.artistUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {commonsMeta.artist}
                        </a>
                      ) : (
                        commonsMeta.artist
                      )}
                      {' ｜ '}
                    </>
                  )}
                  <SiWikimediacommons />{' '}
                  <a
                    href={commonsMeta?.descriptionUrl ?? commonsPageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Wikimedia Commons
                  </a>
                </>
              ) : image.user ? (
                gm?.viewer.uploaded({
                  username: <UserChip key={image.user.id} user={image.user} />,
                  createdAt: createdAt ? (
                    <b key={createdAt.getTime()}>
                      {dateFormat.format(createdAt)}
                    </b>
                  ) : (
                    '-'
                  ),
                })
              ) : null}

              {(capturedDate || capturedRaw) && (
                <>
                  {' ｜ '}
                  {gm?.viewer.captured(
                    <b
                      key={capturedDate ? capturedDate.getTime() : capturedRaw}
                    >
                      {capturedDate
                        ? dateFormat.format(capturedDate)
                        : capturedRaw}
                    </b>,
                  )}
                </>
              )}

              {azimuth != null && (
                <>
                  {' ｜ '}
                  <Azimuth value={azimuth} size={18} />
                </>
              )}

              {' ｜ '}

              <Rating
                className={classes.stars}
                size={22}
                initialValue={rating}
                readonly
              />

              {tags && tags.length > 0 && ' ｜ '}

              {tags?.map((tag) => (
                <Fragment key={tag}>
                  {' '}
                  <Badge bg="secondary">{tag}</Badge>
                </Fragment>
              ))}

              {badgeLicense ? (
                <>
                  {' ｜ '}
                  <LongPressTooltip
                    label={
                      <>
                        {gm?.license.descriptions[badgeLicense]}
                        {!isWikimedia &&
                          image.licenseSince &&
                          gm?.license.since && (
                            <>
                              <br />
                              {gm.license.since}{' '}
                              {dateFormat.format(image.licenseSince)}
                            </>
                          )}
                      </>
                    }
                  >
                    {({ props }) => (
                      <span {...props}>
                        <LicenseBadge licenseId={badgeLicense} />{' '}
                        <a href={licenseUrl} target="license" rel="noreferrer">
                          {licenseName}
                        </a>
                      </span>
                    )}
                  </LongPressTooltip>
                </>
              ) : (
                isWikimedia &&
                commonsMeta?.license && (
                  <>
                    {' ｜ '}
                    {commonsMeta.licenseUrl ? (
                      <a
                        href={commonsMeta.licenseUrl}
                        target="license"
                        rel="noreferrer"
                      >
                        {commonsMeta.license}
                      </a>
                    ) : (
                      commonsMeta.license
                    )}
                  </>
                )
              )}

              {displayDescription && ` ｜ ${displayDescription}`}

              {!isFullscreen && editModel && (
                <Form id="gallery-edit-form" onSubmit={handleSave}>
                  <hr />

                  <h5>{gm?.viewer.modify}</h5>

                  <GalleryEditForm
                    model={editModel}
                    allTags={allTags}
                    errors={saveErrors}
                    onPositionPick={handlePositionPick}
                    onModelChange={handleEditModelChange}
                  />
                </Form>
              )}

              {!isFullscreen && !editModel && (
                <>
                  <hr />

                  <h5>{gm?.viewer.comments}</h5>

                  {!comments ? null : comments.length ? (
                    comments.map((c) => (
                      <p key={c.id}>
                        {dateFormat.format(c.createdAt)}{' '}
                        <UserChip user={c.user} />: {c.comment}
                      </p>
                    ))
                  ) : (
                    <p>
                      <i>{gm?.viewer.noComments}</i>
                    </p>
                  )}

                  {user && (
                    <Form onSubmit={handleCommentFormSubmit}>
                      <Form.Group controlId="comment" className="mb-3">
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder={gm?.viewer.newComment}
                            value={comment}
                            onChange={(e) => {
                              dispatch(
                                gallerySetComment(e.currentTarget.value),
                              );
                            }}
                            maxLength={4096}
                            disabled={disabledPremium}
                          />

                          <Button
                            variant="secondary"
                            type="submit"
                            disabled={comment.length < 1 || disabledPremium}
                          >
                            {gm?.viewer.addComment}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Form>
                  )}

                  {user && (
                    <div className="d-flex flex-wrap f-gap-1 align-items-center mb-3">
                      <span className="flex-shrink-0">
                        {gm?.viewer.yourRating}
                      </span>

                      {disabledPremium ? null : (
                        <Rating
                          className={clsx(
                            classes.stars,
                            'ms-1',
                            'flex-shrink-0',
                          )}
                          size={22}
                          allowFraction={false}
                          initialValue={myStars ?? 0}
                          onClick={handleStarsChange}
                        />
                      )}

                      {editModel === null && tags && canEdit && (
                        <RecentTags
                          existingTags={tags}
                          onAdd={handleTagAdd}
                          prefix={<div>｜</div>}
                        />
                      )}

                      {editModel === null && canEdit && (
                        <>
                          ｜
                          <Form.Check
                            id="chk-fast-premium"
                            label={gm?.uploadModal.premium}
                            checked={premium}
                            onChange={handlePremiumChange}
                          />
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {canEdit &&
          (editModel ? (
            <Button variant="primary" type="submit" form="gallery-edit-form">
              <FaSave /> {m?.general.save}
            </Button>
          ) : (
            <LongPressTooltip breakpoint="sm" label={m?.general.modify} kbd="m">
              {({ label, labelClassName, props }) => (
                <Button
                  variant="secondary"
                  onClick={() => {
                    dispatch(galleryEditPicture());
                  }}
                  {...props}
                >
                  <FaPencilAlt />

                  <span className={labelClassName}> {label}</span>
                </Button>
              )}
            </LongPressTooltip>
          ))}

        {canEdit && (
          <LongPressTooltip breakpoint="sm" label={m?.general.delete}>
            {({ label, labelClassName, props }) => (
              <Button onClick={handleDelete} variant="danger" {...props}>
                <FaTrash />
                <span className={labelClassName}> {label}</span> <kbd>Del</kbd>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {!editModel && (
          <>
            <LongPressTooltip
              breakpoint="md"
              label={gm?.viewer.showOnTheMap}
              kbd="s"
            >
              {({ label, labelClassName, props }) => (
                <Button
                  variant="secondary"
                  onClick={() => {
                    dispatch(galleryShowOnTheMap());
                  }}
                  {...props}
                >
                  <FaRegDotCircle />

                  <span className={labelClassName}> {label}</span>
                </Button>
              )}
            </LongPressTooltip>

            {'exitFullscreen' in document && (
              <LongPressTooltip
                breakpoint="md"
                label={m?.general.fullscreen}
                kbd="f"
              >
                {({ label, labelClassName, props }) => (
                  <Button
                    variant="secondary"
                    onClick={handleFullscreen}
                    {...props}
                  >
                    <RiFullscreenLine />

                    <span className={labelClassName}> {label}</span>
                  </Button>
                )}
              </LongPressTooltip>
            )}

            {lat !== undefined && lon !== undefined && (
              <LongPressTooltip
                breakpoint="md"
                label={gm?.viewer.openInNewWindow}
              >
                {({ label, labelClassName, props }) => (
                  <OpenInExternalAppMenuButton
                    lat={lat}
                    lon={lon}
                    placement="top"
                    includePoint
                    pointTitle={displayTitle ?? undefined}
                    pointDescription={displayDescription ?? undefined}
                    url={url}
                    {...props}
                  >
                    <FaExternalLinkAlt />
                    <span className={labelClassName}> {label}</span>
                  </OpenInExternalAppMenuButton>
                )}
              </LongPressTooltip>
            )}
          </>
        )}

        {editModel ? (
          <Button
            variant="dark"
            onClick={() => {
              dispatch(galleryEditPicture());
            }}
          >
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        ) : (
          <LongPressTooltip label={m?.general.close} breakpoint="md" kbd="Esc">
            {({ label, labelClassName, props }) => (
              <Button variant="dark" onClick={close} {...props}>
                <FaTimes />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}
      </Modal.Footer>
    </Modal>
  );
}
