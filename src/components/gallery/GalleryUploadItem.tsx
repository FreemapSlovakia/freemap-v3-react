import React, { useCallback } from 'react';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import 'fm3/styles/react-tag-autocomplete.css';

import Button from 'react-bootstrap/lib/Button';
import {
  GalleryEditForm,
  PictureModel,
} from 'fm3/components/gallery/GalleryEditForm';
import { Translator } from 'fm3/l10nInjector';
import { GalleryTag } from 'fm3/actions/galleryActions';
import spinnerbar from 'fm3/images/spinnerbar.gif';

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
  t: Translator;
  showPreview: boolean;
}

const GalleryUploadItem: React.FC<Props> = ({
  id,
  filename,
  url,
  disabled,
  model,
  allTags,
  errors,
  t,
  showPreview,
  onRemove,
  onPositionPick,
  onModelChange,
}) => {
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
    <React.Fragment key={id}>
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
          t={t}
          onPositionPick={disabled ? undefined : handlePositionPick}
          onModelChange={handleModelChange}
        />{' '}
        <Button onClick={handleRemove} bsStyle="danger">
          <FontAwesomeIcon icon="times" /> {t('general.remove')}
        </Button>
      </fieldset>
      <hr />
    </React.Fragment>
  );
};
