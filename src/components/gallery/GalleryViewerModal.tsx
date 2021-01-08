/* eslint-disable react/display-name */

import {
  galleryClear,
  galleryDeletePicture,
  galleryEditPicture,
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
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import {
  GalleryEditForm,
  PictureModel,
} from 'fm3/components/gallery/GalleryEditForm';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import 'fm3/styles/gallery.scss';
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
import { useDispatch, useSelector } from 'react-redux';
import ReactStars from 'react-stars';
import { getType } from 'typesafe-actions';
import { OpenInExternalAppMenuButton } from '../OpenInExternalAppMenuButton';

type Props = { show: boolean };

export function GalleryViewerModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const imageIds = useSelector((state: RootState) => state.gallery.imageIds);

  const image = useSelector((state: RootState) => state.gallery.image);

  const activeImageId2 = useSelector(
    (state: RootState) => state.gallery.activeImageId,
  );

  const comment = useSelector((state: RootState) => state.gallery.comment);

  const editModel = useSelector((state: RootState) => state.gallery.editModel);

  const saveErrors = useSelector(
    (state: RootState) => state.gallery.saveErrors,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const allTags = useSelector((state: RootState) => state.gallery.tags);

  const language = useSelector((state: RootState) => state.l10n.language);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const [loading, setLoading] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [imgKey, setImgKey] = useState(0);

  const [activeImageId, setActiveImageId] = useState<number | null>(null);

  const imageElement = useRef<HTMLImageElement>();

  const fullscreenElement = useRef<HTMLDivElement>();

  if (activeImageId2 !== activeImageId) {
    setLoading(true);
    setActiveImageId(activeImageId2);
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

  const setFullscreenElement = (element: HTMLDivElement) => {
    fullscreenElement.current = element;
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

  const handleFullscreen = useCallback(() => {
    if (!document.exitFullscreen || !fullscreenElement.current) {
      // unsupported
    } else if (document.fullscreenElement === fullscreenElement.current) {
      document.exitFullscreen();
    } else {
      fullscreenElement.current.requestFullscreen();
    }
  }, []);

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

  const nextImageId = imageIds && imageIds[index + 1];

  const prevImageId = index > 0 && imageIds && imageIds[index - 1];

  // TODO const loadingMeta = !image || image.id !== activeImageId;

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getImageUrl = (id: number) =>
    `${process.env.API_URL}/gallery/pictures/${id}/image?width=${Math.round(
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
              style={{ width: 'auto', display: 'inline-block' }}
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
          ref={setFullscreenElement}
          className={isFullscreen ? 'fullscreen' : ''}
        >
          <div className="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                {!!activeImageId && (
                  <img
                    key={imgKey}
                    ref={setImageElement}
                    className={`gallery-image ${loading ? 'loading' : ''}`}
                    src={getImageUrl(activeImageId)}
                    alt={title ?? undefined}
                  />
                )}
                {!!nextImageId && !loading && (
                  <img
                    key={`next-${imgKey}`}
                    className="d-none"
                    src={getImageUrl(nextImageId)}
                    alt="next"
                  />
                )}
                {!!prevImageId && !loading && (
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
              <a
                className={`carousel-control-prev ${
                  index < 1 ? 'carousel-control-disabled' : ''
                }`}
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
              </a>
            )}
            {imageIds && (
              <a
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
              </a>
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
                    m={m}
                    model={editModel}
                    allTags={allTags}
                    errors={saveErrors}
                    onPositionPick={handlePositionPick}
                    onModelChange={handleEditModelChange}
                  />
                  <Button variant="primary" type="submit">
                    <FontAwesomeIcon icon="floppy-o" /> {m?.general.save}
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
                    <div>
                      {m?.gallery.viewer.yourRating}{' '}
                      <ReactStars
                        className="stars"
                        size={22}
                        half={false}
                        value={myStars ?? 0}
                        onChange={handleStarsChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {image && user && (user.isAdmin || user.id === image.user.id) && (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(galleryEditPicture());
              }}
              active={!!editModel}
            >
              <FontAwesomeIcon icon="pencil" />
              <span className="d-none d-sm-inline">
                {' '}
                {m?.general.modify} <kbd>M</kbd>
              </span>
            </Button>
            <Button
              onClick={() => {
                dispatch(
                  toastsAdd({
                    id: 'gallery.deletePicture',
                    messageKey: 'gallery.viewer.deletePrompt',
                    style: 'warning',
                    cancelType: [
                      getType(galleryClear),
                      getType(galleryRequestImage),
                    ],
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
              }}
              variant="danger"
            >
              <FontAwesomeIcon icon="trash" />
              <span className="d-none d-sm-inline"> {m?.general.delete}</span>
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(galleryShowOnTheMap());
          }}
        >
          <FontAwesomeIcon icon="dot-circle-o" />
          <span className="d-none d-md-inline">
            {' '}
            {m?.gallery.viewer.showOnTheMap} <kbd>S</kbd>
          </span>
        </Button>
        {'exitFullscreen' in document && (
          <Button variant="secondary" onClick={handleFullscreen}>
            <FontAwesomeIcon icon="arrows-alt" />
            <span className="d-none d-md-inline"> {m?.general.fullscreen}</span>
          </Button>
        )}
        {lat !== undefined && lon !== undefined && (
          <OpenInExternalAppMenuButton
            lat={lat}
            lon={lon}
            mapType={'X'}
            zoom={14}
            expertMode={expertMode}
            placement="top"
            includePoint
            pointTitle={title ?? undefined}
            pointDescription={description ?? undefined}
            url={`${process.env.API_URL}/gallery/pictures/${activeImageId}/image`}
          >
            <FontAwesomeIcon icon="external-link" />
            <span className="d-none d-md-inline">
              {' '}
              {m?.gallery.viewer.openInNewWindow}
            </span>
          </OpenInExternalAppMenuButton>
        )}
        <Button variant="dark" onClick={close}>
          <FontAwesomeIcon icon="close" />
          <span className="d-none d-md-inline">
            {' '}
            {m?.general.close} <kbd>Esc</kbd>
          </span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
