import 'pannellum';
import 'pannellum/build/pannellum.css';
import {
  ChangeEvent,
  FormEvent,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import {
  FaExternalLinkAlt,
  FaGem,
  FaPencilAlt,
  FaRegDotCircle,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { RiFullscreenLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { Rating } from 'react-simple-star-rating';
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
} from '../../actions/galleryActions.js';
import { toastsAdd } from '../../actions/toastsActions.js';
import {
  GalleryEditForm,
  PictureModel,
} from '../../components/gallery/GalleryEditForm.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useBecomePremium } from '../../hooks/useBecomePremium.js';
import { useDateTimeFormat } from '../../hooks/useDateTimeFormat.js';
import { useMessages } from '../../l10nInjector.js';
import { isPremium } from '../../premium.js';
import { OpenInExternalAppMenuButton } from '../OpenInExternalAppMenuButton.js';
import { RecentTags } from './RecentTags.js';

import '../../styles/gallery.scss';

type Props = { show: boolean };

export default GalleryViewerModal;

export function GalleryViewerModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const imageIds = useAppSelector((state) => state.gallery.imageIds);

  const image = useAppSelector((state) => state.gallery.image);

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

  const imageElement = useRef<HTMLImageElement>(undefined);

  const fullscreenElement = useRef<HTMLDivElement | null>(null);

  const becomePremium = useBecomePremium();

  if (reduxActiveImageId !== activeImageId) {
    setLoading(true);

    setActiveImageId(reduxActiveImageId);
  }

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

  const setImageElement = (element: HTMLImageElement) => {
    imageElement.current = element;

    if (element) {
      element.addEventListener('load', () => {
        setLoading(false);
      });
    }
  };

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

        if (isNaN(idx)) {
          throw new Error();
        }

        dispatch(galleryRequestImage(imageIds[idx]));
      }
    },
    [dispatch, imageIds],
  );

  const handleCommentFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      dispatch(gallerySubmitComment());
    },
    [dispatch],
  );

  const {
    title = '...',
    description = undefined,
    createdAt = undefined,
    takenAt = undefined,
    tags = undefined,
    comments = undefined,
    rating = undefined,
    myStars = undefined,
    lat,
    lon,
  } = image || {};

  const premium = Boolean(image?.premium);

  const disabledPremium =
    premium && !isPremium(user) && user?.id !== image?.user.id;

  const pano = Boolean(image?.pano);

  const p = activeImageId !== null && pano;

  const panoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!p || !panoRef.current) {
      return;
    }

    const v = window.pannellum.viewer(panoRef.current, {
      panorama: `${process.env['API_URL']}/gallery/pictures/${activeImageId}/image`,
      type: 'equirectangular',
      autoLoad: true,
      showControls: false,
      autoRotate: 15,
      autoRotateInactivityDelay: 60000,
      // compass: true,
      // title: 'panorama',
    });

    return () => {
      v.destroy();
    };
  }, [p, activeImageId]);

  const handleFullscreen = useCallback(() => {
    if (!document.exitFullscreen || !fullscreenElement.current) {
      // unsupported
    } else if (document.fullscreenElement === fullscreenElement.current) {
      document.exitFullscreen();
    } else {
      fullscreenElement.current.requestFullscreen();
    }
  }, []);

  const handleDelete = useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'gallery.deletePicture',
        messageKey: 'gallery.viewer.deletePrompt',
        style: 'warning',
        cancelType: [galleryClear.type, galleryRequestImage.type],
        actions: [
          {
            nameKey: 'general.yes',
            action: galleryDeletePicture(),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
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

    window.addEventListener('keypress', handler);

    return () => window.removeEventListener('keypress', handler);
  }, [handleDelete, handleFullscreen, show]);

  // fullscreen of pano fails when traversing from non-pano picture
  useEffect(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [pano]);

  const handleSave = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(gallerySavePicture());
    },
    [dispatch],
  );

  const index = imageIds
    ? imageIds.findIndex((id) => id === activeImageId)
    : -1;

  const nextImageId = imageIds && imageIds[index + 1];

  const prevImageId = index > 0 ? imageIds && imageIds[index - 1] : null;

  // TODO const loadingMeta = !image || image.id !== activeImageId;

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getImageUrl = (id: number) => {
    const width = Math.round(
      window.devicePixelRatio *
        (isFullscreen
          ? window.innerWidth
          : window.matchMedia('(min-width: 1200px)').matches
            ? 1110
            : window.matchMedia('(min-width: 992px)').matches
              ? 770
              : 470),
    );

    return (
      `${process.env['API_URL']}/gallery/pictures/${id}/image?width=${width}` +
      (user ? '&authToken=' + encodeURIComponent(user.authToken) : '')
    );
  };

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

  const canEdit = !!(
    image &&
    user &&
    (user.isAdmin || user.id === image.user.id)
  );

  const handleTagAdd = (tag: string) => {
    dispatch(galleryQuickAddTag(tag));
  };

  return (
    <Modal show={show} onHide={close} size="xl" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {m?.gallery.viewer.title}{' '}
          {imageIds && (
            <Form.Select
              value={index}
              onChange={handleIndexChange}
              className="w-auto d-inline-block"
            >
              {imageIds.map((_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </Form.Select>
          )}
          {imageIds ? ` / ${imageIds.length} ` : ''}
          {title && `- ${title}`}
          {premium && (
            <>
              {' '}
              <FaGem className="text-warning" />
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          ref={fullscreenElement}
          className={isFullscreen ? 'fullscreen' : ''}
        >
          <div className="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                {activeImageId === null ? null : pano ? (
                  <div
                    ref={panoRef}
                    key={'pano-' + activeImageId}
                    id={String(activeImageId)}
                    style={
                      isFullscreen
                        ? { width: '100vw', height: '100vh' }
                        : {
                            height:
                              Math.max(window.innerHeight - 400, 300) + 'px',
                            width:
                              (window.matchMedia('(min-width: 1200px)').matches
                                ? 1110
                                : window.matchMedia('(min-width: 992px)')
                                      .matches
                                  ? 770
                                  : 470) + 'px',
                          }
                    }
                  />
                ) : disabledPremium ? (
                  <Alert variant="warning" className="text-center mb-0">
                    {m?.gallery.viewer.premiumOnly}

                    {becomePremium && (
                      <>
                        <br />
                        <Button onClick={becomePremium} className="mt-3">
                          <FaGem /> {m?.premium.becomePremium}
                        </Button>
                      </>
                    )}
                  </Alert>
                ) : (
                  <div className="gallery-image-container">
                    <img
                      key={imgKey}
                      ref={setImageElement}
                      className={`gallery-image ${loading ? 'loading' : ''}`}
                      src={getImageUrl(activeImageId)}
                      alt={title ?? undefined}
                    />
                    <a
                      href="https://creativecommons.org/licenses/by-sa/4.0/"
                      target="cc-by-sa"
                      rel="noreferrer"
                    >
                      CC BY-SA 4.0
                    </a>
                  </div>
                )}

                {nextImageId != null && !loading && (
                  <img
                    key={`next-${imgKey}`}
                    className="d-none"
                    src={getImageUrl(nextImageId)}
                    alt="next"
                  />
                )}

                {prevImageId != null && !loading && (
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
                className={`carousel-control-prev ${
                  index < 1 ? 'carousel-control-disabled' : ''
                } ${pano ? 'carousel-control-short' : ''}`}
                onClick={() => dispatch(galleryRequestImage('prev'))}
              >
                <span className="carousel-control-prev-icon" />
              </button>
            )}

            {imageIds && (
              <button
                type="button"
                className={`carousel-control-next ${
                  index >= imageIds.length - 1
                    ? 'carousel-control-disabled'
                    : ''
                }`}
                onClick={() => dispatch(galleryRequestImage('next'))}
              >
                <span className="carousel-control-next-icon" />
              </button>
            )}
          </div>

          <br />

          {image && (
            <div className="footer">
              {isFullscreen && imageIds && (
                <>{`${index + 1} / ${imageIds.length}`} ｜ </>
              )}

              {isFullscreen && title && <>{title} ｜ </>}

              {m?.gallery.viewer.uploaded({
                username: <b key={image.user.name}>{image.user.name}</b>,
                createdAt: createdAt ? (
                  <b key={createdAt.getTime()}>
                    {dateFormat.format(createdAt)}
                  </b>
                ) : (
                  '-'
                ),
              })}

              {takenAt && (
                <>
                  {' ｜ '}
                  {m?.gallery.viewer.captured(
                    <b key={takenAt.getTime()}>{dateFormat.format(takenAt)}</b>,
                  )}
                </>
              )}

              {' ｜ '}

              <Rating
                className="stars"
                size={22}
                initialValue={rating}
                readonly
              />

              {description && ` ｜ ${description}`}

              {tags && tags.length > 0 && ' ｜ '}

              {tags &&
                tags.map((tag) => (
                  <Fragment key={tag}>
                    {' '}
                    <Badge bg="secondary">{tag}</Badge>
                  </Fragment>
                ))}

              {!isFullscreen && editModel && (
                <Form onSubmit={handleSave}>
                  <hr />

                  <h5>{m?.gallery.viewer.modify}</h5>

                  <GalleryEditForm
                    model={editModel}
                    allTags={allTags}
                    errors={saveErrors}
                    onPositionPick={handlePositionPick}
                    onModelChange={handleEditModelChange}
                  />

                  <Button variant="primary" type="submit">
                    <FaSave /> {m?.general.save}
                  </Button>
                </Form>
              )}

              {!isFullscreen && (
                <>
                  <hr />

                  <h5>{m?.gallery.viewer.comments}</h5>

                  {!comments ? null : comments.length ? (
                    comments.map((c) => (
                      <p key={c.id}>
                        {dateFormat.format(c.createdAt)} <b>{c.user.name}</b>:{' '}
                        {c.comment}
                      </p>
                    ))
                  ) : (
                    <p>
                      <i>{m?.gallery.viewer.noComments}</i>
                    </p>
                  )}

                  {user && (
                    <Form onSubmit={handleCommentFormSubmit}>
                      <Form.Group className="mb-3">
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder={m?.gallery.viewer.newComment}
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
                            {m?.gallery.viewer.addComment}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Form>
                  )}

                  {user && (
                    <div className="d-flex f-gap-1 align-items-center mb-3">
                      <span className="flex-shrink-0">
                        {m?.gallery.viewer.yourRating}
                      </span>

                      {disabledPremium ? null : (
                        <Rating
                          className="stars ms-1 flex-shrink-0"
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
                            label={m?.gallery.uploadModal.premium}
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
        {canEdit && (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(galleryEditPicture());
              }}
              active={!!editModel}
            >
              <FaPencilAlt />

              <span className="d-none d-sm-inline">
                {' '}
                {m?.general.modify} <kbd>m</kbd>
              </span>
            </Button>

            <Button onClick={handleDelete} variant="danger">
              <FaTrash />

              <span className="d-none d-sm-inline">
                {' '}
                {m?.general.delete} <kbd>Del</kbd>
              </span>
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          onClick={() => {
            dispatch(galleryShowOnTheMap());
          }}
        >
          <FaRegDotCircle />

          <span className="d-none d-md-inline">
            {' '}
            {m?.gallery.viewer.showOnTheMap} <kbd>s</kbd>
          </span>
        </Button>

        {'exitFullscreen' in document && (
          <Button variant="secondary" onClick={handleFullscreen}>
            <RiFullscreenLine />

            <span className="d-none d-md-inline">
              {' '}
              {m?.general.fullscreen} <kbd>f</kbd>
            </span>
          </Button>
        )}

        {lat !== undefined && lon !== undefined && (
          <OpenInExternalAppMenuButton
            lat={lat}
            lon={lon}
            placement="top"
            includePoint
            pointTitle={title ?? undefined}
            pointDescription={description ?? undefined}
            url={`${process.env['API_URL']}/gallery/pictures/${activeImageId}/image`}
          >
            <FaExternalLinkAlt />

            <span className="d-none d-md-inline">
              {' '}
              {m?.gallery.viewer.openInNewWindow}
            </span>
          </OpenInExternalAppMenuButton>
        )}

        <Button variant="dark" onClick={close}>
          <FaTimes />

          <span className="d-none d-md-inline">
            {' '}
            {m?.general.close} {editModel ? null : <kbd>Esc</kbd>}
          </span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
