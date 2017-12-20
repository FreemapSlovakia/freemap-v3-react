import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import 'react-tag-autocomplete/example/styles.css';

import Button from 'react-bootstrap/lib/Button';
import Thumbnail from 'react-bootstrap/lib/Thumbnail';
import * as FmPropTypes from 'fm3/propTypes';
import GalleryEditForm from 'fm3/components/GalleryEditForm';


export default class GalleryUploadItem extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    filename: PropTypes.string,
    url: PropTypes.string,
    model: FmPropTypes.galleryPictureModel.isRequired,
    allTags: FmPropTypes.allTags.isRequired,
    error: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onModelChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }

  handleRemove = () => {
    this.props.onRemove(this.props.id);
  }

  handlePositionPick = () => {
    this.props.onPositionPick(this.props.id);
  }

  handleModelChange = (model) => {
    this.props.onModelChange(this.props.id, model);
  }

  render() {
    const {
      id, filename, url, disabled, model, allTags, error,
    } = this.props;
    return (
      <Thumbnail key={id} src={url || require('fm3/images/spinnerbar.gif')} alt={filename}>
        <fieldset disabled={disabled}>
          <GalleryEditForm
            {...{ model, allTags, error }}
            onPositionPick={disabled ? null : this.handlePositionPick}
            onModelChange={this.handleModelChange}
          />
          {' '}
          <Button onClick={this.handleRemove} bsStyle="danger">
            <FontAwesomeIcon icon="times" /> Odstrániť
          </Button>
        </fieldset>
      </Thumbnail>
    );
  }
}
