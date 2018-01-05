/* eslint-disable jsx-a11y/no-static-element-interactions */ // prevented warning in bootstrap code

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import ReactStars from 'react-stars';

import * as at from 'fm3/actionTypes';
import * as FmPropTypes from 'fm3/propTypes';
import injectL10n from 'fm3/l10nInjector';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import GalleryEditForm from 'fm3/components/GalleryEditForm';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Label from 'react-bootstrap/lib/Label';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import { toastsAdd } from 'fm3/actions/toastsActions';

import { galleryClear, galleryRequestImage, galleryShowOnTheMap, gallerySetComment, gallerySubmitComment, gallerySubmitStars,
  galleryEditPicture, galleryDeletePicture, gallerySetEditModel, gallerySavePicture, gallerySetItemForPositionPicking } from 'fm3/actions/galleryActions';

import 'fm3/styles/gallery.scss';

class GalleryViewerModal extends React.Component {
  static propTypes = {
    imageIds: PropTypes.arrayOf(PropTypes.number.isRequired),
    image: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
      createdAt: PropTypes.instanceOf(Date).isRequired,
      takenAt: PropTypes.instanceOf(Date),
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      comments: PropTypes.arrayOf(PropTypes.shape({
        createdAt: PropTypes.instanceOf(Date).isRequired,
        user: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
        comment: PropTypes.string,
      })).isRequired,
      rating: PropTypes.number.isRequired,
      myStars: PropTypes.number,
    }),
    activeImageId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onImageSelect: PropTypes.func.isRequired,
    comment: PropTypes.string.isRequired,
    onShowOnTheMap: PropTypes.func.isRequired,
    onCommentChange: PropTypes.func.isRequired,
    onCommentSubmit: PropTypes.func.isRequired,
    onStarsChange: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      isAdmin: PropTypes.bool,
    }),
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    editModel: FmPropTypes.galleryPictureModel,
    onEditModelChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    allTags: FmPropTypes.allTags.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    language: PropTypes.string,
  }

  state = {
    loading: true,
    isFullscreen: false,
    imgKey: 0,
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeImageId !== this.props.activeImageId) {
      this.setState({
        loading: true,
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  setImageElement = (imageElement) => {
    this.imageElement = imageElement;
    if (imageElement) {
      imageElement.addEventListener('load', this.handleImageLoad);
    }
  }

  setFullscreenElement = (element) => {
    this.fullscreenElement = element;
  }

  handleFullscreenChange = () => {
    this.setState({
      isFullscreen: document.fullscreenElement === this.fullscreenElement,
      imgKey: this.state.imgKey + 1,
    });

    this.forceUpdate();
  }

  handleEditModelChange = (editModel) => {
    this.props.onEditModelChange(editModel);
  }

  handleKeydown = (evt) => {
    if (['input', 'select', 'textarea'].includes(evt.target.tagName.toLowerCase())
      || !this.props.imageIds || this.props.imageIds.length < 2) {
      // nothing
    } else if (evt.keyCode === 37 /* left key */) {
      this.handlePreviousClick();
    } else if (evt.keyCode === 39 /* right key */) {
      this.handleNextClick();
    }
  }

  handlePreviousClick = (e) => {
    if (e) {
      e.preventDefault();
    }

    const { imageIds, activeImageId, onImageSelect } = this.props;
    const index = imageIds.findIndex(id => id === activeImageId);
    if (index > 0) {
      onImageSelect(imageIds[index - 1]);
    }
  }

  handleNextClick = (e) => {
    if (e) {
      e.preventDefault();
    }

    const { imageIds, activeImageId, onImageSelect } = this.props;
    const index = imageIds.findIndex(id => id === activeImageId);
    if (index + 1 < imageIds.length) {
      onImageSelect(imageIds[index + 1]);
    }
  }

  handleCommentFormSubmit = (e) => {
    e.preventDefault();
    this.props.onCommentSubmit();
  }

  handleCommentChange = (e) => {
    this.props.onCommentChange(e.target.value);
  }

  handleImageLoad = () => {
    this.setState({ loading: false });
  }

  handleFullscreen = () => {
    if (document.fullscreenElement === this.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.fullscreenElement.requestFullscreen();
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.onSave();
  }

  render() {
    const {
      imageIds, activeImageId, onClose, onShowOnTheMap, image, comment,
      onStarsChange, user, onDelete, onEdit, editModel, allTags, onPositionPick, language, t,
    } = this.props;
    const index = imageIds && imageIds.findIndex(id => id === activeImageId);
    const { title = '...', description, createdAt, takenAt, tags, comments, rating, myStars } = image || {};
    const { isFullscreen, loading, imgKey } = this.state;

    const nextImageId = imageIds && imageIds[index + 1];

    // TODO const loadingMeta = !image || image.id !== activeImageId;

    const dateFormat = new Intl.DateTimeFormat(language, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
      <Modal show onHide={onClose} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>
            {t('gallery.viewer.title')}
            {' '}
            {imageIds ? `${index + 1} / ${imageIds.length} ` : ''}{title && `- ${title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div ref={this.setFullscreenElement} className={isFullscreen ? 'fullscreen' : ''}>
            <div className="carousel">
              <div className="item active">
                <img
                  key={imgKey}
                  ref={this.setImageElement}
                  className={`gallery-image ${loading ? 'loading' : ''}`}
                  src={`${process.env.API_URL}/gallery/pictures/${activeImageId}/image?width=${isFullscreen ? window.innerWidth : window.matchMedia('(min-width: 992px)').matches ? 868 : 568}`}
                  sizes={isFullscreen ? undefined : '(min-width: 992px) 868px, 568px'}
                  alt={title}
                />
                {
                  nextImageId !== undefined && !loading &&
                    <img
                      key={`next-${imgKey}`}
                      style={{ display: 'none' }}
                      src={`${process.env.API_URL}/gallery/pictures/${nextImageId}/image?width=${isFullscreen ? window.innerWidth : window.matchMedia('(min-width: 992px)').matches ? 868 : 568}`}
                      sizes={isFullscreen ? undefined : '(min-width: 992px) 868px, 568px'}
                      alt="next"
                    />
                }
              </div>
              {imageIds &&
                <a
                  className={`left carousel-control ${index < 1 ? 'disabled' : ''}`}
                  onClick={this.handlePreviousClick}
                >
                  <Glyphicon glyph="chevron-left" />
                </a>
              }
              {imageIds &&
                <a
                  className={`right carousel-control ${index >= imageIds.length - 1 ? 'disabled' : ''}`}
                  onClick={this.handleNextClick}
                >
                  <Glyphicon glyph="chevron-right" />
                </a>
              }
            </div>
            <br />
            {image &&
              <div className="footer">
                {isFullscreen && imageIds && <React.Fragment>{`${index + 1} / ${imageIds.length}`} ｜ </React.Fragment>}
                {isFullscreen && title && <React.Fragment>{title} ｜ </React.Fragment>}
                {
                  t('gallery.viewer.uploaded', {
                    username: () => <b key={image.user.name}>{image.user.name}</b>,
                    createdAt: () => <b key={createdAt}>{dateFormat.format(createdAt)}</b>,
                  })
                }
                {takenAt &&
                  <React.Fragment>
                    {' ｜ '}
                    {
                      t('gallery.viewer.captured', {
                        takenAt: () => <b key={takenAt}>{dateFormat.format(takenAt)}</b>,
                      })
                    }
                  </React.Fragment>
                }
                {' ｜ '}
                <ReactStars className="stars" size={22} value={rating} edit={false} />
                {description && ` ｜ ${description}`}
                {tags.length > 0 && ' ｜ '}
                {tags.map(tag => <React.Fragment key={tag}> <Label>{tag}</Label></React.Fragment>)}
                {!isFullscreen && editModel &&
                  <form onSubmit={this.handleSave}>
                    <hr />
                    <h5>Úprava</h5>

                    <GalleryEditForm
                      t={t}
                      language={language}
                      model={editModel}
                      allTags={allTags}
                      error={null}
                      onPositionPick={onPositionPick}
                      onModelChange={this.handleEditModelChange}
                    />
                    {/* TODO put inside a form and save in onSubmit */}
                    <Button bsStyle="primary" type="submit">
                      <Glyphicon glyph="save" /> {t('general.save')}
                    </Button>
                  </form>
                }
                {!isFullscreen &&
                  <React.Fragment>
                    <hr />
                    <h5>{t('gallery.viewer.comments')}</h5>
                    {comments.map(c => (
                      <p key={c.id}>
                        {dateFormat.format(c.createdAt)} <b>{c.user.name}</b>: {c.comment}
                      </p>
                    ))}
                    {user &&
                      <form onSubmit={this.handleCommentFormSubmit}>
                        <FormGroup>
                          <InputGroup>
                            <FormControl
                              type="text"
                              placeholder={t('gallery.viewer.newComment')}
                              value={comment}
                              onChange={this.handleCommentChange}
                              maxLength={4096}
                            />
                            <InputGroup.Button>
                              <Button type="submit" disabled={comment.length < 1}>
                                {t('gallery.viewer.addComment')}
                              </Button>
                            </InputGroup.Button>
                          </InputGroup>
                        </FormGroup>
                      </form>
                    }
                    {user &&
                      <div>
                        {t('gallery.viewer.yourRating')}
                        {' '}
                        <ReactStars
                          className="stars"
                          size={22}
                          half={false}
                          value={myStars}
                          onChange={onStarsChange}
                        />
                      </div>
                    }
                  </React.Fragment>
                }
              </div>
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          {image && user && (user.isAdmin || user.id === image.user.id) &&
            <React.Fragment>
              <Button onClick={onEdit} active={!!editModel}>
                <Glyphicon glyph="edit" />
                <span className="hidden-xs"> {t('general.modify')}</span>
              </Button>
              <Button onClick={onDelete} bsStyle="danger">
                <Glyphicon glyph="trash" />
                <span className="hidden-xs"> {t('general.delete')}</span>
              </Button>
            </React.Fragment>
          }
          <Button onClick={onShowOnTheMap}>
            <FontAwesomeIcon icon="dot-circle-o" />
            <span className="hidden-xs"> {t('gallery.viewer.showOnTheMap')}</span>
          </Button>
          <Button onClick={this.handleFullscreen}>
            <Glyphicon glyph="fullscreen" />
            <span className="hidden-xs hidden-sm"> {t('general.fullscreen')}</span>
          </Button>
          <Button href={`${process.env.API_URL}/gallery/pictures/${activeImageId}/image`} target="_blank">
            <FontAwesomeIcon icon="external-link" />
            <span className="hidden-sm hidden-xs"> {t('gallery.viewer.openInNewWindow')}</span>
          </Button>
          <Button onClick={onClose}>
            <Glyphicon glyph="remove" />
            <span className="hidden-xs"> {t('general.close')}</span>
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      imageIds: state.gallery.imageIds,
      image: state.gallery.image,
      activeImageId: state.gallery.activeImageId,
      zoom: state.map.zoom,
      pickingPosition: state.gallery.pickingPositionForId !== null,
      comment: state.gallery.comment,
      editModel: state.gallery.editModel,
      user: state.auth.user,
      allTags: state.gallery.tags,
      language: state.l10n.language,
    }),
    dispatch => ({
      onClose() {
        dispatch(galleryClear(null));
      },
      onShowOnTheMap() {
        dispatch(galleryShowOnTheMap(true));
      },
      onImageSelect(id) {
        dispatch(galleryRequestImage(id));
      },
      onCommentChange(comment) {
        dispatch(gallerySetComment(comment));
      },
      onCommentSubmit() {
        dispatch(gallerySubmitComment());
      },
      onStarsChange(stars) {
        dispatch(gallerySubmitStars(stars));
      },
      onEdit() {
        dispatch(galleryEditPicture());
      },
      onDelete() {
        dispatch(toastsAdd({
          collapseKey: 'gallery.deletePicture',
          messageKey: 'gallery.viewer.deletePrompt',
          style: 'warning',
          cancelType: [at.GALLERY_CLEAR, at.GALLERY_REQUEST_IMAGE],
          actions: [
            { nameKey: 'general.yes', action: galleryDeletePicture(), style: 'danger' },
            { nameKey: 'general.no' },
          ],
        }));
      },
      onEditModelChange(editModel) {
        dispatch(gallerySetEditModel(editModel));
      },
      onSave() {
        dispatch(gallerySavePicture());
      },
      onPositionPick() {
        dispatch(gallerySetItemForPositionPicking(-1));
      },
    }),
  ),
)(GalleryViewerModal);
