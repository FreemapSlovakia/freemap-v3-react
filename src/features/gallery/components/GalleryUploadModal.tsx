import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { toDatetimeLocal } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import clsx from 'clsx';
import {
  type DragEvent as ReactDragEvent,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { type FileRejection, useDropzone } from 'react-dropzone';
import { FaCamera, FaTimes, FaUpload } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { isUploadablePicture } from '../galleryUtils.js';
import { usePictureDropHandler } from '../hooks/usePictureDropHandler.js';
import {
  type GalleryItem,
  galleryAddItem,
  galleryMergeItem,
  galleryRemoveItem,
  gallerySetItemForPositionPicking,
  gallerySetLicense,
  galleryTogglePremium,
  galleryToggleShowPreview,
  galleryUpload,
} from '../model/actions.js';
import { loadGalleryMessages } from '../translations/loadGalleryMessages.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import type { PictureModel } from './GalleryEditForm.js';
import { GalleryLicenseSelect } from './GalleryLicenseSelect.js';
import { GalleryUploadItem } from './GalleryUploadItem.js';
import classes from './GalleryUploadModal.module.css';

type Props = { show: boolean };

export default function GalleryUploadModal({ show }: Props): ReactElement {
  const m = useMessages();

  const online = useOnline();

  const gm = useGalleryMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const items = useAppSelector((state) => state.gallery.items);

  const uploading = useAppSelector((state) =>
    Boolean(state.gallery.uploadingId),
  );

  const allTags = useAppSelector((state) => state.gallery.tags);

  const showPreview = useAppSelector((state) => state.gallery.showPreview);

  const language = useAppSelector((state) => state.l10n.language);

  const defaultPremium = useAppSelector(
    (state) => state.gallerySettings.premium,
  );

  // Checkbox reflects the current batch: all-premium when items exist (the
  // `indeterminate` ref handles the mixed case), else the persisted default.
  const premium = useMemo(
    () => (items.length ? items.every((item) => item.premium) : defaultPremium),
    [items, defaultPremium],
  );

  const defaultLicense = useAppSelector(
    (state) => state.gallerySettings.license,
  );

  // The batch-wide license: the common one when all items agree, else the
  // persisted default (undefined renders a "mixed" placeholder on the toggle).
  const license = useMemo(() => {
    if (!items.length) {
      return defaultLicense;
    }

    const first = items[0].license;

    return items.every((item) => item.license === first) ? first : undefined;
  }, [items, defaultLicense]);

  const handleItemMerge = useCallback(
    (item: Pick<GalleryItem, 'id'> & Partial<GalleryItem>) => {
      dispatch(galleryMergeItem(item));
    },
    [dispatch],
  );

  const handleModelChange = (id: number, model: PictureModel) => {
    const azimuth = parseFloat(model.azimuth);

    handleItemMerge({
      id,
      ...model,
      azimuth: Number.isNaN(azimuth) ? null : azimuth,
      takenAt: model.takenAt ? new Date(model.takenAt) : null,
    });
  };

  const handleClose = async () => {
    if (
      !items.length ||
      (await confirm({
        message: m?.general.closeWithoutSaving,
        confirmLabel: m?.general.yes,
        cancelLabel: m?.general.no,
        confirmStyle: 'danger',
      }))
    ) {
      dispatch(setActiveModal(null));
    }
  };

  const handleItemAdd = (item: GalleryItem) => {
    dispatch(galleryAddItem(item));
  };

  const handleFileDrop = usePictureDropHandler(
    showPreview,
    language,
    handleItemAdd,
    handleItemMerge,
  );

  const warnNotAdded = () => {
    dispatch(
      toastsAdd({
        id: 'gallery.notAdded',
        style: 'danger',
        timeout: 5000,
        messageKey: 'uploadModal.notAdded',
        messageLoader: loadGalleryMessages,
      }),
    );
  };

  const handleDrop = (accepted: File[], rejected: FileRejection[]) => {
    handleFileDrop(accepted);

    if (rejected.length) {
      warnNotAdded();
    }
  };

  const { getRootProps, getInputProps, open, isFileDialogActive } = useDropzone(
    {
      onDrop: handleDrop,
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/heic': ['.heic'],
        'image/heif': ['.heif'],
      },
    },
  );

  const handlePositionPick = (id: number) => {
    dispatch(gallerySetItemForPositionPicking(id));
  };

  const handleItemRemove = (id: number) => {
    dispatch(galleryRemoveItem(id));
  };

  const premiumCheck = useRef<HTMLInputElement | null>(null);
  const [draggingOverDropzone, setDraggingOverDropzone] = useState(false);

  const handleDropzoneDragCapture = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingOverDropzone(true);
  };

  const handleDropzoneDragLeaveCapture = (
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingOverDropzone(false);
  };

  const handleDropzoneDropCapture = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingOverDropzone(false);

    // This capture handler stops the event, so react-dropzone's own drop never
    // runs — the filtering and the warning have to happen here.
    const files = Array.from(event.dataTransfer?.files ?? []);

    const droppedFiles = files.filter(isUploadablePicture);

    if (droppedFiles.length) {
      handleFileDrop(droppedFiles);
    }

    if (droppedFiles.length < files.length) {
      warnNotAdded();
    }
  };

  const handleDropzoneMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    open();
  };

  // react-dropzone opens the picker on the click that follows too, and its
  // second `open()` clears the file input while the picker is already up, which
  // on iOS loses the selection. Stopping propagation skips its click handler.
  const handleDropzoneClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isFileDialogActive) {
      event.stopPropagation();
    }
  };

  useEffect(() => {
    if (!premiumCheck.current) {
      return;
    }

    const len = items.filter((item) => item.premium).length;

    premiumCheck.current.indeterminate = len > 0 && len !== items.length;
  }, [items]);

  useEffect(() => {
    if (!show) {
      setDraggingOverDropzone(false);
    }
  }, [show]);

  useDocumentTitle(show ? gm?.uploadModal.title : undefined);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera /> <FaUpload /> {gm?.uploadModal.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        {items.length > 0 && (
          <div className={classes.uploadItems}>
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
                license,
              }) => (
                <GalleryUploadItem
                  key={id}
                  id={id}
                  m={m}
                  file={file}
                  previewKey={previewKey}
                  model={{
                    premium,
                    license,
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
              disabled={Boolean(items.length)}
              label={gm?.uploadModal.showPreview}
            />

            <Form.Check
              id="chk-premium"
              type="checkbox"
              onChange={() => dispatch(galleryTogglePremium(!premium))}
              checked={premium}
              label={gm?.uploadModal.premium}
              ref={premiumCheck}
            />

            <Form.Group controlId="upload-license" className="mt-2 mb-1">
              <Form.Label>{gm?.license.label}</Form.Label>

              <GalleryLicenseSelect
                value={license}
                placeholder="—"
                onChange={(l) => dispatch(gallerySetLicense(l))}
              />
            </Form.Group>

            <div
              {...getRootProps({
                onMouseDown: handleDropzoneMouseDown,
                onClick: handleDropzoneClick,
                onDragEnterCapture: handleDropzoneDragCapture,
                onDragOverCapture: handleDropzoneDragCapture,
                onDragLeaveCapture: handleDropzoneDragLeaveCapture,
                onDropCapture: handleDropzoneDropCapture,
              })}
              className={clsx(
                'dropzone',
                draggingOverDropzone && 'dropzone-dropping',
              )}
            >
              <input {...getInputProps()} />

              <p className={classes.dropHint}>{gm?.uploadModal.hint.drop}</p>

              <p className={classes.tapHint}>{gm?.uploadModal.hint.tap}</p>

              {m && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: gm?.uploadModal.rules ?? '',
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
          disabled={uploading || !online}
        >
          <FaUpload />{' '}
          {uploading
            ? gm?.uploadModal.uploading(items.length)
            : gm?.uploadModal.upload}
        </Button>

        <Button onClick={handleClose} variant="dark">
          <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
