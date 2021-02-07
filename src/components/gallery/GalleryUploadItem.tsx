import { GalleryTag } from 'fm3/actions/galleryActions';
import {
  GalleryEditForm,
  PictureModel,
} from 'fm3/components/gallery/GalleryEditForm';
import spinnerbar from 'fm3/images/spinnerbar.gif';
import 'fm3/styles/react-tag-autocomplete.css';
import { Messages } from 'fm3/translations/messagesInterface';
import { Fragment, ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { FaTimes } from 'react-icons/fa';

interface Props {
  id: number;
  filename: string;
  url?: string;
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
  url,
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

  return (
    <Fragment key={id}>
      {showPreview ? (
        <img
          className="gallery-image gallery-image-upload"
          src={url || spinnerbar}
          alt={filename}
        />
      ) : (
        <h4>{filename}</h4>
      )}
      <fieldset disabled={disabled}>
        <GalleryEditForm
          {...{ model, allTags, errors }}
          m={m}
          onPositionPick={disabled ? undefined : handlePositionPick}
          onModelChange={handleModelChange}
        />{' '}
        <Button onClick={handleRemove} variant="danger">
          <FaTimes /> {m?.general.remove}
        </Button>
      </fieldset>
      <hr />
    </Fragment>
  );
}
