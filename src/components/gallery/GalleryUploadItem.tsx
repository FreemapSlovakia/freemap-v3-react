import React from 'react';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import 'fm3/styles/react-tag-autocomplete.css';

import Button from 'react-bootstrap/lib/Button';
import GalleryEditForm, {
  IPictureModel,
} from 'fm3/components/gallery/GalleryEditForm';
import { Translator } from 'fm3/l10nInjector';
import { IGalleryTag } from 'fm3/actions/galleryActions';

interface IProps {
  id: number;
  filename: string;
  url: string;
  model: IPictureModel;
  allTags: IGalleryTag[];
  error: string | null | undefined;
  onRemove: (id: number) => void;
  onPositionPick: (id: number) => void;
  onModelChange: (id: number, model: IPictureModel) => void;
  disabled: boolean;
  t: Translator;
  language: string;
  showPreview: boolean;
}

export default class GalleryUploadItem extends React.Component<IProps> {
  handleRemove = () => {
    this.props.onRemove(this.props.id);
  };

  handlePositionPick = () => {
    this.props.onPositionPick(this.props.id);
  };

  handleModelChange = (model: IPictureModel) => {
    this.props.onModelChange(this.props.id, model);
  };

  render() {
    const {
      id,
      filename,
      url,
      disabled,
      model,
      allTags,
      error,
      t,
      language,
      showPreview,
    } = this.props;
    return (
      <React.Fragment key={id}>
        {showPreview ? (
          <img
            className="gallery-image gallery-image-upload"
            src={url || require('fm3/images/spinnerbar.gif')}
            alt={filename}
          />
        ) : (
          <h4>{filename}</h4>
        )}
        <fieldset disabled={disabled}>
          <GalleryEditForm
            {...{ model, allTags, error }}
            t={t}
            language={language}
            onPositionPick={disabled ? undefined : this.handlePositionPick}
            onModelChange={this.handleModelChange}
          />{' '}
          <Button onClick={this.handleRemove} bsStyle="danger">
            <FontAwesomeIcon icon="times" /> {t('general.remove')}
          </Button>
        </fieldset>
        <hr />
      </React.Fragment>
    );
  }
}
