import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { toDatetimeLocal } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect, useRef } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaCamera, FaTimes, FaUpload } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { usePictureDropHandler } from '../hooks/usePictureDropHandler.js';
import {
  galleryAddItem,
  GalleryItem,
  galleryMergeItem,
  galleryRemoveItem,
  gallerySetItemForPositionPicking,
  galleryTogglePremium,
  galleryToggleShowPreview,
  galleryUpload,
} from '../model/actions.js';
import { PictureModel } from './GalleryEditForm.js';
import { GalleryUploadItem } from './GalleryUploadItem.js';

type Props = { show: boolean };

export default GalleryUploadModal;

export function GalleryUploadModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const items = useAppSelector((state) => state.gallery.items);

  const uploading = useAppSelector((state) => !!state.gallery.uploadingId);

  const allTags = useAppSelector((state) => state.gallery.tags);

  const showPreview = useAppSelector((state) => state.gallery.showPreview);

  const language = useAppSelector((state) => state.l10n.language);

  const premium = useAppSelector((state) => state.gallery.premium);

  const handleItemMerge = useCallback(
    (item: Pick<GalleryItem, 'id'> & Partial<GalleryItem>) => {
      dispatch(galleryMergeItem(item));
    },
    [dispatch],
  );

  const handleModelChange = useCallback(
    (id: number, model: PictureModel) => {
      const azimuth = parseFloat(model.azimuth);

      handleItemMerge({
        id,
        ...model,
        azimuth: Number.isNaN(azimuth) ? null : azimuth,
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
              action: setActiveModal(null),
              style: 'danger',
            },
            { nameKey: 'general.no' },
          ],
        }),
      );
    } else {
      dispatch(setActiveModal(null));
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
    accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
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

  const premiumCheck = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!premiumCheck.current) {
      return;
    }

    const len = items.filter((item) => item.premium).length;

    premiumCheck.current.indeterminate = len > 0 && len !== items.length;
  }, [premium, items]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera /> <FaUpload /> {m?.gallery.uploadModal.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {items.length > 0 && (
          <div className="fm-gallery-upload-items">
            {items.map(
              ({
                id,
                file,
                previewKey,
                title,
                description,
                takenAt,
                tags,
                errors,
                dirtyPosition,
                azimuth,
                premium,
              }) => (
                <GalleryUploadItem
                  key={id}
                  id={id}
                  m={m}
                  file={file}
                  previewKey={previewKey}
                  model={{
                    premium,
                    dirtyPosition,
                    azimuth: typeof azimuth === 'number' ? String(azimuth) : '',
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
                  onPreview={handleItemMerge}
                />
              ),
            )}
          </div>
        )}

        {!uploading && (
          <>
            {items.length > 0 && <hr />}

            <Form.Check
              id="chk-preview"
              type="checkbox"
              onChange={() => dispatch(galleryToggleShowPreview())}
              checked={showPreview}
              disabled={!!items.length}
              label={m?.gallery.uploadModal.showPreview}
            />

            <Form.Check
              id="chk-premium"
              type="checkbox"
              onChange={() => dispatch(galleryTogglePremium())}
              checked={premium}
              label={m?.gallery.uploadModal.premium}
              ref={premiumCheck}
            />

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
          <FaUpload />{' '}
          {uploading
            ? m?.gallery.uploadModal.uploading(items.length)
            : m?.gallery.uploadModal.upload}
        </Button>

        <Button onClick={handleClose} variant="dark">
          <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
