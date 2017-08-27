import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ReactTags from 'react-tag-autocomplete';
import 'react-tag-autocomplete/example/styles.css';

import Button from 'react-bootstrap/lib/Button';
import Thumbnail from 'react-bootstrap/lib/Thumbnail';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Alert from 'react-bootstrap/lib/Alert';

import { formatGpsCoord } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';

export default class GalleryUploadItem extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    filename: PropTypes.string,
    url: PropTypes.string,
    model: PropTypes.shape({
      position: FmPropTypes.point,
      title: PropTypes.string,
      description: PropTypes.string,
      takenAt: PropTypes.instanceOf(Date),
      tags: PropTypes.arrayOf(PropTypes.string.isRequired),
    }),
    allTags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
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

  handleTitleChange = (e) => {
    this.props.onModelChange(this.props.id, { ...this.props.model, title: e.target.value || null });
  }

  handleDescriptionChange = (e) => {
    this.props.onModelChange(this.props.id, { ...this.props.model, description: e.target.value || null });
  }

  handleTakenAtChange = (e) => {
    this.props.onModelChange(this.props.id, { ...this.props.model, takenAt: e.target.value ? new Date(e.target.value) : null });
  }

  handleTagAdded = ({ name }) => {
    if (!this.props.model.tags.includes(name)) {
      this.props.onModelChange(this.props.id, { ...this.props.model, tags: [...this.props.model.tags, name] });
    }
  }

  handleTagDeleted = (i) => {
    const tags = [...this.props.model.tags];
    tags.splice(i, 1);
    this.props.onModelChange(this.props.id, { ...this.props.model, tags });
  }

  render() {
    const { id, filename, url, disabled, model, allTags, error } = this.props;
    return (
      <Thumbnail key={id} src={url || require('fm3/images/spinnerbar.gif')} alt={filename}>
        {error && <Alert bsStyle="danger">{error}</Alert>}
        <fieldset disabled={disabled}>
          <FormGroup>
            <FormControl placeholder="Názov" type="text" value={model.title} onChange={this.handleTitleChange} />
          </FormGroup>
          <FormGroup>
            <FormControl placeholder="Popis" componentClass="textarea" value={model.description} onChange={this.handleDescriptionChange} />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="datetime-local"
              placeholder="Dátum a čas fotenia"
              value={model.takenAt ? `${zeropad(model.takenAt.getFullYear(), 4)}-${zeropad(model.takenAt.getMonth() + 1)}-${zeropad(model.takenAt.getDate())}T${zeropad(model.takenAt.getHours())}:${zeropad(model.takenAt.getMinutes())}:${zeropad(model.takenAt.getSeconds())}` : ''}
              onChange={this.handleTakenAtChange}
            />
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Pozícia"
                value={model.position ? `${formatGpsCoord(model.position.lat, 'SN')}, ${formatGpsCoord(model.position.lon, 'WE')}` : ''}
                onClick={this.handlePositionPick}
                readOnly
              />
              <InputGroup.Button>
                <Button onClick={this.handlePositionPick}><FontAwesomeIcon icon="dot-circle-o" />Nastaviť pozíciu</Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <ReactTags
              placeholder="Tagy"
              tags={model.tags.map(tag => ({ id: tag, name: tag }))}
              suggestions={allTags.map(tag => ({ id: tag, name: tag }))}
              handleAddition={this.handleTagAdded}
              handleDelete={this.handleTagDeleted}
              allowNew
            />
          </FormGroup>
          {' '}
          <Button onClick={this.handleRemove} bsStyle="danger"><FontAwesomeIcon icon="times" />Odstrániť</Button>
        </fieldset>
      </Thumbnail>
    );
  }
}

function zeropad(v, n = 2) {
  const raw = `0000${v}`;
  return raw.substring(raw.length - n, raw.length);
}
