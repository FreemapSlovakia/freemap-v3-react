import React, { ReactElement, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import {
  galleryAddItem,
  galleryRemoveItem,
  galleryMergeItem,
  gallerySetItemForPositionPicking,
  galleryUpload,
  galleryHideUploadModal,
  galleryToggleShowPreview,
  GalleryItem,
} from 'fm3/actions/galleryActions';

import { toastsAdd } from 'fm3/actions/toastsActions';

import { GalleryUploadItem } from 'fm3/components/gallery/GalleryUploadItem';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { toDatetimeLocal } from 'fm3/dateUtils';
import { RootState } from 'fm3/storeCreator';
import { PictureModel } from './GalleryEditForm';
import { usePictureDropHandler } from '../../hooks/pictureDropHandlerHook';

export function GalleryUploadModal(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.gallery.items);

  const visible = useSelector(
    (state: RootState) => state.gallery.pickingPositionForId === null,
  );

  const uploading = useSelector(
    (state: RootState) => !!state.gallery.uploadingId,
  );

  const allTags = useSelector((state: RootState) => state.gallery.tags);

  const showPreview = useSelector(
    (state: RootState) => state.gallery.showPreview,
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const handleItemMerge = useCallback(
    (item: Pick<GalleryItem, 'id'> & Partial<GalleryItem>) => {
      dispatch(galleryMergeItem(item));
    },
    [dispatch],
  );

  const handleModelChange = useCallback(
    (id: number, model: PictureModel) => {
      handleItemMerge({
        id,
        ...model,
        takenAt: model.takenAt ? new Date(model.takenAt) : null,
      });
    },
    [handleItemMerge],
  );

  const handleClose = useCallback(() => {
    if (items.length) {
      dispatch(
        toastsAdd({
          id: 'galleryUploadModal.close',
          messageKey: 'general.closeWithoutSaving',
          style: 'warning',
          actions: [
            {
              nameKey: 'general.yes',
              action: galleryHideUploadModal(),
              style: 'danger',
            },
            { nameKey: 'general.no' },
          ],
        }),
      );
    } else {
      dispatch(galleryHideUploadModal());
    }
  }, [dispatch, items]);

  const handleItemAdd = useCallback(
    (item: GalleryItem) => {
      dispatch(galleryAddItem(item));
    },
    [dispatch],
  );

  const handleFileDrop = usePictureDropHandler(
    showPreview,
    language,
    handleItemAdd,
    handleItemMerge,
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: '.jpg,.jpeg',
  });

  const handlePositionPick = useCallback(
    (id: number) => {
      dispatch(gallerySetItemForPositionPicking(id));
    },
    [dispatch],
  );

  const handleItemRemove = useCallback(
    (id: number) => {
      dispatch(galleryRemoveItem(id));
    },
    [dispatch],
  );

  return (
    <Modal show={visible} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{m?.gallery.uploadModal.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {items.map(
          ({
            id,
            file,
            url,
            title,
            description,
            takenAt,
            tags,
            errors,
            dirtyPosition,
          }) => (
            <GalleryUploadItem
              key={id}
              id={id}
              m={m}
              filename={file.name}
              url={url}
              model={{
                dirtyPosition,
                title,
                description,
                takenAt: takenAt ? toDatetimeLocal(takenAt) : '',
                tags,
              }}
              allTags={allTags}
              errors={errors}
              onRemove={handleItemRemove}
              onPositionPick={handlePositionPick}
              onModelChange={handleModelChange}
              disabled={uploading}
              showPreview={showPreview}
            />
          ),
        )}
        {!uploading && (
          <>
            <Checkbox
              onChange={() => {
                dispatch(galleryToggleShowPreview());
              }}
              checked={showPreview}
              disabled={!!items.length}
            >
              {m?.gallery.uploadModal.showPreview}
            </Checkbox>

            <div
              {...getRootProps()}
              className={`dropzone${isDragActive ? ' dropzone-dropping' : ''}`}
            >
              <input {...getInputProps()} />
              {m && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: m.gallery.uploadModal.rules,
                  }}
                />
              )}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            dispatch(galleryUpload());
          }}
          disabled={uploading}
        >
          <FontAwesomeIcon icon="upload" />{' '}
          {uploading
            ? m?.gallery.uploadModal.uploading(items.length)
            : m?.gallery.uploadModal.upload}
        </Button>
        <Button onClick={handleClose} bsStyle="danger">
          <Glyphicon glyph="remove" /> {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
