import {
  galleryAddItem,
  GalleryItem,
  galleryMergeItem,
  galleryRemoveItem,
  gallerySetItemForPositionPicking,
  galleryToggleShowPreview,
  galleryUpload,
} from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { GalleryUploadItem } from 'fm3/components/gallery/GalleryUploadItem';
import { toDatetimeLocal } from 'fm3/dateUtils';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import FormCheck from 'react-bootstrap/FormCheck';
import Modal from 'react-bootstrap/Modal';
import { useDropzone } from 'react-dropzone';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { usePictureDropHandler } from '../../hooks/usePictureDropHandler';
import { PictureModel } from './GalleryEditForm';

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
    accept: 'image/jpeg,.jpg,.jpeg',
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
    <Modal show={show} onHide={handleClose}>
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
            <FormCheck
              id="chk-preview"
              type="checkbox"
              onChange={() => {
                dispatch(galleryToggleShowPreview());
              }}
              checked={showPreview}
              disabled={!!items.length}
              label={m?.gallery.uploadModal.showPreview}
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
