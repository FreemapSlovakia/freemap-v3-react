import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { GalleryTag } from '../../actions/galleryActions.js';
import {
  GalleryEditForm,
  PictureModel,
} from '../../components/gallery/GalleryEditForm.js';
import { getPreview, loadPreview } from '../../imagePreview.js';
import spinnerbar from '../../images/spinnerbar.gif';
import { Messages } from '../../translations/messagesInterface.js';

interface Props {
  id: number;
  file: File;
  previewKey?: {};
  model: PictureModel;
  allTags: GalleryTag[];
  errors: string[] | null | undefined;
  onRemove: (id: number) => void;
  onPositionPick: (id: number) => void;
  onModelChange: (id: number, model: PictureModel) => void;
  disabled: boolean;
  m?: Messages;
  showPreview: boolean;
  onPreview: (data: { id: number; previewKey: {} }) => void;
}

export function GalleryUploadItem({
  id,
  file,
  previewKey,
  disabled,
  model,
  allTags,
  errors,
  m,
  showPreview,
  onRemove,
  onPositionPick,
  onModelChange,
  onPreview,
}: Props): ReactElement {
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

  return (
    <div key={id}>
      {showPreview2 && !previewKey ? (
        <img
          className="gallery-image gallery-image-upload"
          src={spinnerbar}
          alt={file.name}
        />
      ) : showPreview2 && previewKey ? (
        <div ref={canvasContainer} className="mb-3" />
      ) : (
        <Button
          className="mb-3 d-block mx-auto"
          onClick={handleLoadPreviewClick}
        >
          {m?.gallery.uploadModal.loadPreview}
        </Button>
      )}

      <fieldset disabled={disabled}>
        <GalleryEditForm
          id={id}
          {...{ model, allTags, errors }}
          onPositionPick={disabled ? undefined : handlePositionPick}
          onModelChange={handleModelChange}
        />

        <div className="d-flex justify-content-between align-items-end">
          <Button onClick={handleRemove} variant="danger">
            <FaTimes /> {m?.general.remove}
          </Button>

          <small className="text-muted lh-1">{file.name}</small>
        </div>
      </fieldset>
    </div>
  );
}
