import { Fragment, ReactElement, useCallback, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { GalleryTag } from '../../actions/galleryActions.js';
import {
  GalleryEditForm,
  PictureModel,
} from '../../components/gallery/GalleryEditForm.js';
import { getPreview } from '../../imagePreview.js';
import spinnerbar from '../../images/spinnerbar.gif';
import { Messages } from '../../translations/messagesInterface.js';

interface Props {
  id: number;
  filename: string;
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
}

export function GalleryUploadItem({
  id,
  filename,
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

  return (
    <Fragment key={id}>
      {showPreview && !previewKey ? (
        <img
          className="gallery-image gallery-image-upload"
          src={spinnerbar}
          alt={filename}
        />
      ) : showPreview && previewKey ? (
        <div ref={canvasContainer} />
      ) : (
        <h4>{filename}</h4>
      )}
      <fieldset disabled={disabled}>
        <GalleryEditForm
          id={id}
          {...{ model, allTags, errors }}
          onPositionPick={disabled ? undefined : handlePositionPick}
          onModelChange={handleModelChange}
        />

        <Button onClick={handleRemove} variant="danger">
          <FaTimes /> {m?.general.remove}
        </Button>
      </fieldset>
      <hr />
    </Fragment>
  );
}
