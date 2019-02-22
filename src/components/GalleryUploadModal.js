import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import each from 'async/each';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import * as FmPropTypes from 'fm3/propTypes';

import { galleryAddItem, galleryRemoveItem, gallerySetItem, gallerySetItemForPositionPicking,
  galleryUpload, galleryHideUploadModal, galleryToggleShowPreview } from 'fm3/actions/galleryActions';

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
    onShowPreviewToggle: PropTypes.func.isRequired,
    uploading: PropTypes.bool,
    t: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
    showPreview: PropTypes.bool,
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

      // try {
      //   keywords.push(...tags.Keywords.description.split(',').map(x => x.trim()).filter(x => x));
      // } catch (e) {
      //   // ignore
      // }
      // try {
      //   keywords.push(...tags.subject.value.map(({ description }) => description));
      // } catch (e) {
      //   // ignore
      // }

      const id = nextId;
      nextId += 1;

      const NS = { S: -1, N: 1 };
      const EW = { W: -1, E: 1 };

      const description = tags.description ? tags.description.description : tags.ImageDescription ? tags.ImageDescription.description : '';
      const takenAtRaw = tags.DateTimeOriginal || tags.DateTime;
      const [rawLat, latRef] = adaptGpsCoordinate(tags.GPSLatitude);
      const [rawLon, lonRef] = adaptGpsCoordinate(tags.GPSLongitude);

      const lat = rawLat * (NS[(latRef || (tags.GPSLatitudeRef || { value: [] }).value[0] || '').toUpperCase()] || Number.NaN);
      const lon = rawLon * (EW[(lonRef || (tags.GPSLongitudeRef || { value: [] }).value[0] || '').toUpperCase()] || Number.NaN);

      this.props.onItemAdd({
        id,
        file,
        position: Number.isNaN(lat) || Number.isNaN(lon) ? null : { lat, lon },
        title: tags.title ? tags.title.description : tags.DocumentName ? tags.DocumentName.description : '',
        description: /CAMERA|^DCIM/.test(description) ? '' : description,
        takenAt: takenAtRaw ? new Date(takenAtRaw.description.replace(/^(\d+):(\d+):(\d+)/, '$1-$2-$3')) : null,
        tags: keywords,
      });

      if (!this.props.showPreview) {
        cb();
        return;
      }

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
    const { items, onPositionPick, visible, onUpload, uploading, allTags, t, language, showPreview, onShowPreviewToggle } = this.props;

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
                showPreview={showPreview}
              />
            ))
          }
          {!uploading && (
            <>
              <Checkbox onChange={onShowPreviewToggle} checked={showPreview} disabled={!!items.length}>
                {t('gallery.uploadModal.showPreview')}
              </Checkbox>

              <Dropzone
                onDrop={this.handleFileDrop}
                accept=".jpg,.jpeg"
                className="dropzone"
                disablePreview
              >
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <div dangerouslySetInnerHTML={{ __html: t('gallery.uploadModal.rules') }} />
                  </div>
                )}
              </Dropzone>
            </>
          )}
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

// adds support for Olympus and other weirdos
function adaptGpsCoordinate(x) {
  if (!x) {
    return [Number.NaN, null];
  }

  // { value: "48,57.686031N", attributes: {}, description: "48.96143385N" }

  const { description, value } = x;
  const p = /^(?:(\d+),)?(\d+(?:\.\d+)?)([NSWE])?$/;
  const m1 = p.exec(description);
  const m2 = p.exec(value);
  if (m1 && (!m2 || !m2[3])) {
    return parse2(m1);
  }
  if (m2) {
    return parse2(m2);
  }
  return [Number.NaN, null];
}

function parse2(m) {
  return [m[1] === undefined ? parseFloat(m[2]) : (parseInt(m[1], 10) + parseFloat(m[2]) / 60), m[3] || null];
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      items: state.gallery.items,
      visible: state.gallery.pickingPositionForId === null,
      uploading: !!state.gallery.uploadingId,
      allTags: state.gallery.tags,
      showPreview: state.gallery.showPreview,
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
      onShowPreviewToggle() {
        dispatch(galleryToggleShowPreview());
      },
    }),
  ),
)(GalleryUploadModal);
