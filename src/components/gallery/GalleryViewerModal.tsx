import {
  galleryClear,
  galleryDeletePicture,
  galleryEditPicture,
  galleryQuickAddTag,
  galleryRequestImage,
  gallerySavePicture,
  gallerySetComment,
  gallerySetEditModel,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
  gallerySubmitComment,
  gallerySubmitStars,
} from 'fm3/actions/galleryActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  GalleryEditForm,
  PictureModel,
} from 'fm3/components/gallery/GalleryEditForm';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useDateTimeFormat } from 'fm3/hooks/useDateTimeFormat';
import { useMessages } from 'fm3/l10nInjector';
import 'fm3/styles/gallery.scss';
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
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import {
  FaExternalLinkAlt,
  FaPencilAlt,
  FaRegDotCircle,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { RiFullscreenLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import ReactStars from 'react-stars';
import { getType } from 'typesafe-actions';
import { OpenInExternalAppMenuButton } from '../OpenInExternalAppMenuButton';
import { RecentTags } from './RecentTags';

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

  const imageElement = useRef<HTMLImageElement>();

  const fullscreenElement = useRef<HTMLDivElement | null>(null);

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
    pano,
  } = image || {};

  const p = activeImageId !== null && pano;

  const panoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (p) {
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
    }
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
        cancelType: [getType(galleryClear), getType(galleryRequestImage)],
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

  const getImageUrl = (id: number) =>
    `${process.env['API_URL']}/gallery/pictures/${id}/image?width=${Math.round(
      window.devicePixelRatio *
        (isFullscreen
          ? window.innerWidth
          : window.matchMedia('(min-width: 1200px)').matches
            ? 1110
            : window.matchMedia('(min-width: 992px)').matches
              ? 770
              : 470),
    )}`;

  const handlePositionPick = useCallback(() => {
    dispatch(gallerySetItemForPositionPicking(-1));
  }, [dispatch]);

  const handleStarsChange = useCallback(
    (stars: number) => {
      dispatch(gallerySubmitStars(stars));
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
            <FormControl
              as="select"
              value={index}
              onChange={handleIndexChange}
              className="w-auto d-inline-block"
            >
              {imageIds.map((_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </FormControl>
          )}
          {imageIds ? ` / ${imageIds.length} ` : ''}
          {title && `- ${title}`}
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
                ) : (
                  <img
                    key={imgKey}
                    ref={setImageElement}
                    className={`gallery-image ${loading ? 'loading' : ''}`}
                    src={getImageUrl(activeImageId)}
                    alt={title ?? undefined}
                  />
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
                className={`carousel-control-prev ${
                  index < 1 ? 'carousel-control-disabled' : ''
                } ${pano ? 'carousel-control-short' : ''}`}
                onClick={(e) => {
                  e?.preventDefault();

                  dispatch(galleryRequestImage('prev'));
                }}
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                />

                <span className="sr-only">Previous</span>
              </button>
            )}

            {imageIds && (
              <button
                className={`carousel-control-next ${
                  index >= imageIds.length - 1
                    ? 'carousel-control-disabled'
                    : ''
                }`}
                onClick={(e) => {
                  e?.preventDefault();

                  dispatch(galleryRequestImage('next'));
                }}
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                />

                <span className="sr-only">Next</span>
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

              <ReactStars
                className="stars"
                size={22}
                value={rating}
                edit={false}
              />

              {description && ` ｜ ${description}`}

              {tags && tags.length > 0 && ' ｜ '}

              {tags &&
                tags.map((tag) => (
                  <Fragment key={tag}>
                    {' '}
                    <Badge variant="secondary">{tag}</Badge>
                  </Fragment>
                ))}

              {!isFullscreen && editModel && (
                <form onSubmit={handleSave}>
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
                </form>
              )}

              {!isFullscreen && (
                <>
                  <hr />

                  <h5>{m?.gallery.viewer.comments}</h5>

                  {comments &&
                    comments.map((c) => (
                      <p key={c.id}>
                        {dateFormat.format(c.createdAt)} <b>{c.user.name}</b>:{' '}
                        {c.comment}
                      </p>
                    ))}

                  {user && (
                    <form onSubmit={handleCommentFormSubmit}>
                      <FormGroup>
                        <InputGroup>
                          <FormControl
                            type="text"
                            placeholder={m?.gallery.viewer.newComment}
                            value={comment}
                            onChange={(e) => {
                              dispatch(
                                gallerySetComment(e.currentTarget.value),
                              );
                            }}
                            maxLength={4096}
                          />

                          <InputGroup.Append>
                            <Button
                              variant="secondary"
                              type="submit"
                              disabled={comment.length < 1}
                            >
                              {m?.gallery.viewer.addComment}
                            </Button>
                          </InputGroup.Append>
                        </InputGroup>
                      </FormGroup>
                    </form>
                  )}

                  {user && (
                    <div className="d-flex f-gap-1 align-items-center">
                      <div className="flex-shrink-0">
                        {m?.gallery.viewer.yourRating}
                      </div>

                      <ReactStars
                        className="stars ml-1  flex-shrink-0"
                        size={22}
                        half={false}
                        value={myStars ?? 0}
                        onChange={handleStarsChange}
                      />

                      {editModel === null && tags && canEdit && (
                        <RecentTags
                          existingTags={tags}
                          onAdd={handleTagAdd}
                          prefix={<div>｜</div>}
                        />
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
