import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import each from 'async/each';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';

import * as FmPropTypes from 'fm3/propTypes';

import { galleryAddItem, galleryRemoveItem, gallerySetItem, gallerySetItemForPositionPicking,
  galleryUpload, galleryHideUploadModal } from 'fm3/actions/galleryActions';

import { toastsAdd } from 'fm3/actions/toastsActions';

import GalleryUploadItem from 'fm3/components/GalleryUploadItem';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import injectL10n from 'fm3/l10nInjector';

const ExifReader = require('exifreader');
const pica = require('pica/dist/pica')(); // require('pica') seems not to use service workers

let nextId = 1;

class GalleryUploadModal extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      file: PropTypes.object.isRequired,
      url: PropTypes.string,
      position: FmPropTypes.point,
      title: PropTypes.string,
      description: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      takenAt: PropTypes.date,
      error: PropTypes.string,
    }).isRequired).isRequired,
    allTags: FmPropTypes.allTags.isRequired,
    onItemAdd: PropTypes.func.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onItemChange: PropTypes.func.isRequired,
    visible: PropTypes.bool,
    onUpload: PropTypes.func.isRequired,
    uploading: PropTypes.bool,
    t: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
  }

  handleFileDrop = (acceptedFiles /* , rejectedFiles */) => {
    each(acceptedFiles, this.processFile, (err) => {
      if (err) {
        // TODO
      }
    });
  }

  processFile = (file, cb) => {
    const reader = new FileReader();
    reader.onerror = (err) => {
      cb(err);
    };
    reader.onload = () => {
      let tags;
      try {
        tags = ExifReader.load(reader.result);
      } catch (e) {
        tags = {};
      }

      const keywords = [];

      try {
        keywords.push(...tags.Keywords.description.split(',').map(x => x.trim()).filter(x => x));
      } catch (e) {
        // ignore
      }
      try {
        keywords.push(...tags.subject.value.map(({ description }) => description));
      } catch (e) {
        // ignore
      }

      const id = nextId;
      nextId += 1;

      const takenAtRaw = tags.DateTimeOriginal || tags.DateTime;
      this.props.onItemAdd({
        id,
        file,
        position: tags.GPSLatitude && tags.GPSLongitude ? {
          lat: adaptGpsCoordinate(tags.GPSLatitude) * (tags.GPSLatitudeRef.value[0] === 'S' ? -1 : 1),
          lon: adaptGpsCoordinate(tags.GPSLongitude) * (tags.GPSLongitudeRef.value[0] === 'W' ? -1 : 1),
        } : null,
        title: tags.title ? tags.title.description : tags.DocumentName ? tags.DocumentName.description : '',
        description: tags.description ? tags.description.description : tags.ImageDescription ? tags.ImageDescription.description : '',
        takenAt: takenAtRaw ? new Date(takenAtRaw.description.replace(/^(\d+):(\d+):(\d+)/, '$1-$2-$3')) : null,
        tags: keywords,
      });

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        cb(err);
      };
      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        const ratio = 618 / img.naturalWidth;
        const width = img.naturalWidth * ratio;
        const height = img.naturalHeight * ratio;
        const o = tags.Orientation && tags.Orientation.value || 1;
        canvas.width = width;
        canvas.height = height;

        const transformations = [
          [1, 0, 0, 1, 0, 0],
          [-1, 0, 0, 1, width, 0],
          [-1, 0, 0, -1, width, height],
          [1, 0, 0, -1, 0, height],
          [0, 1, 1, 0, 0, 0],
          [0, 1, -1, 0, height, 0],
          [0, -1, -1, 0, height, width],
          [0, -1, 1, 0, 0, width],
        ];

        pica.resize(img, canvas).then(() => {
          let canvas2;
          if (o === 1) {
            canvas2 = canvas;
          } else {
            canvas2 = document.createElement('canvas');
            const ctx = canvas2.getContext('2d');
            canvas2.width = o > 4 ? height : width;
            canvas2.height = o > 4 ? width : height;
            ctx.transform(...transformations[o - 1]);
            ctx.drawImage(canvas, 0, 0);
          }

          // canvas2.toBlob((blob) => {
          //   this.props.onItemUrlSet(id, URL.createObjectURL(blob));
          //   cb();
          // });
          const item = this.props.items.find(itm => itm.id === id);
          if (item) {
            this.props.onItemChange(id, { ...item, url: canvas2.toDataURL() }); // TODO play with toBlob (not supported in safari)
          }
          cb();
        }).catch((err) => {
          cb(err);
        });
      };

      img.src = url;
    };

    reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
  }

  handleRemove = (id) => {
    this.props.onItemRemove(id);
  }

  handleModelChange = (id, model) => {
    const item = this.props.items.find(itm => itm.id === id);
    if (item) {
      this.props.onItemChange(id, { ...item, ...model });
    }
  }

  handleClose = () => {
    this.props.onClose(!!this.props.items.length);
  }

  render() {
    const { items, onPositionPick, visible, onUpload, uploading, allTags, t, language } = this.props;

    return (
      <Modal show={visible} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('gallery.uploadModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            items.map(({ id, file, url, position, title, description, takenAt, tags, error }) => (
              <GalleryUploadItem
                key={id}
                id={id}
                t={t}
                language={language}
                filename={file.name}
                url={url}
                model={{ position, title, description, takenAt, tags }}
                allTags={allTags}
                error={error}
                onRemove={this.handleRemove}
                onPositionPick={onPositionPick}
                onModelChange={this.handleModelChange}
                disabled={uploading}
              />
            ))
          }
          {!uploading &&
            <Dropzone
              onDrop={this.handleFileDrop}
              accept=".jpg,.jpeg"
              className="dropzone"
              disablePreview
            >
              <div dangerouslySetInnerHTML={{ __html: t('gallery.uploadModal.rules') }} />
            </Dropzone>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onUpload} disabled={uploading}>
            <FontAwesomeIcon icon="upload" />
            {' '}
            {uploading ? t('gallery.uploadModal.uploading', { n: items.length }) : t('gallery.uploadModal.upload') }
          </Button>
          <Button onClick={this.handleClose} bsStyle="danger">
            <Glyphicon glyph="remove" /> {t('general.cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

// adds support for Olympus
function adaptGpsCoordinate({ description }) {
  const m = /^(\d+),(\d+(\.\d+)?)[NSWE]$/.exec(description);
  return m ? parseInt(m[1], 10) + parseFloat(m[2]) / 60 : description;
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      items: state.gallery.items,
      visible: state.gallery.pickingPositionForId === null,
      uploading: !!state.gallery.uploadingId,
      allTags: state.gallery.tags,
      language: state.l10n.language,
    }),
    dispatch => ({
      onItemAdd(item) {
        dispatch(galleryAddItem(item));
      },
      onItemRemove(id) {
        dispatch(galleryRemoveItem(id));
      },
      onUpload() {
        dispatch(galleryUpload());
      },
      onClose(ask) {
        if (ask) {
          dispatch(toastsAdd({
            collapseKey: 'galleryUploadModal.close',
            messageKey: 'general.closeWithoutSaving',
            style: 'warning',
            actions: [
              { nameKey: 'general.yes', action: galleryHideUploadModal(), style: 'danger' },
              { nameKey: 'general.no' },
            ],
          }));
        } else {
          dispatch(galleryHideUploadModal());
        }
      },
      onPositionPick(id) {
        dispatch(gallerySetItemForPositionPicking(id));
      },
      onItemChange(id, item) {
        dispatch(gallerySetItem(id, item));
      },
    }),
  ),
)(GalleryUploadModal);
