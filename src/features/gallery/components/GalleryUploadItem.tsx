import { Text } from '@features/l10n/Text.js';
import { toDatetimeLocal } from '@shared/dateUtils.js';
import { isHeicFile, isHeicSupported } from '@shared/heicSupport.js';
import {
  memo,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import type { Messages } from '@/translations/messagesInterface.js';
import { getPreview, loadPreview } from '../imagePreview.js';
import type { GalleryItem, GalleryTag } from '../model/actions.js';
import { rotationTransform } from '../rotation.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { GalleryEditForm, type PictureModel } from './GalleryEditForm.js';

interface Props {
  item: GalleryItem;
  allTags: GalleryTag[];
  onRemove: (id: number) => void;
  onPositionPick: (id: number) => void;
  onModelChange: (id: number, model: PictureModel) => void;
  disabled: boolean;
  m?: Messages;
  showPreview: boolean;
  onPreview: (data: { id: number; previewKey: object }) => void;
}

// Memoized, and given its store item as is: the upload list may hold hundreds.
export const GalleryUploadItem = memo(function GalleryUploadItem({
  item,
  disabled,
  allTags,
  m,
  showPreview,
  onRemove,
  onPositionPick,
  onModelChange,
  onPreview,
}: Props): ReactElement {
  const { id, file, previewKey, errors } = item;

  const model: PictureModel = useMemo(
    () => ({
      premium: item.premium,
      license: item.license,
      rotation: item.rotation,
      dirtyPosition: item.dirtyPosition,
      azimuth: typeof item.azimuth === 'number' ? String(item.azimuth) : '',
      title: item.title,
      description: item.description,
      takenAt: item.takenAt ? toDatetimeLocal(item.takenAt) : '',
      tags: item.tags,
    }),
    [item],
  );

  const gm = useGalleryMessages();

  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  const handlePositionPick = useCallback(() => {
    onPositionPick(id);
  }, [id, onPositionPick]);

  const handleModelChange = useCallback(
    (model: PictureModel) => {
      onModelChange(id, model);
    },
    [id, onModelChange],
  );

  const canvasContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = previewKey && getPreview(previewKey);

    if (canvas) {
      canvas.className = 'gallery-image gallery-image-upload';

      canvasContainer.current?.appendChild(canvas);
    }
  }, [previewKey]);

  const { rotation } = model;

  useEffect(() => {
    const canvas = previewKey && getPreview(previewKey);

    if (canvas) {
      canvas.style.transform =
        rotationTransform(rotation, canvas.width / canvas.height) ?? '';
    }
  }, [previewKey, rotation]);

  const handleLoadPreviewClick = useCallback(() => {
    setShowPreview2(true);

    loadPreview(file, 618, (err, key) => {
      if (err) {
        // TODO
      } else {
        onPreview({ id, previewKey: key! });
      }
    });
  }, [file, id, onPreview]);

  const [showPreview2, setShowPreview2] = useState(showPreview);

  // The browser may not be able to decode HEIC; if so, previews are unavailable.
  const [previewSupported, setPreviewSupported] = useState(true);

  useEffect(() => {
    if (!isHeicFile(file)) {
      setPreviewSupported(true);

      return;
    }

    let cancelled = false;

    isHeicSupported().then((supported) => {
      if (!cancelled) {
        setPreviewSupported(supported);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div key={id}>
      {!previewSupported ? (
        <Button className="mb-3 d-block mx-auto" disabled>
          <Text m={gm} k="uploadModal.loadPreview" />
        </Button>
      ) : showPreview2 && !previewKey ? (
        <div className="gallery-image gallery-image-upload d-flex justify-content-center align-items-center">
          <Spinner />
        </div>
      ) : showPreview2 && previewKey ? (
        <div ref={canvasContainer} className="mb-3" />
      ) : (
        <Button
          className="mb-3 d-block mx-auto"
          onClick={handleLoadPreviewClick}
        >
          <Text m={gm} k="uploadModal.loadPreview" />
        </Button>
      )}

      <fieldset disabled={disabled}>
        <GalleryEditForm
          id={id}
          // With the preview to show what it turns, unless none can load.
          rotatable={!previewSupported || Boolean(showPreview2 && previewKey)}
          {...{ model, allTags, errors }}
          onPositionPick={disabled ? undefined : handlePositionPick}
          onModelChange={handleModelChange}
        />

        <div className="d-flex justify-content-between align-items-end">
          <Button onClick={handleRemove} variant="danger">
            <FaTimes /> <Text m={m} k="general.remove" />
          </Button>

          <small className="text-muted lh-1">{file.name}</small>
        </div>
      </fieldset>
    </div>
  );
});
