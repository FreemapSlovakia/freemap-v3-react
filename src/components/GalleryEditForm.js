import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ReactTags from 'react-tag-autocomplete';
import 'react-tag-autocomplete/example/styles.css';

import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Alert from 'react-bootstrap/lib/Alert';

import { formatGpsCoord } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';

export default class GalleryEditForm extends React.Component {
  static propTypes = {
    model: FmPropTypes.galleryPictureModel.isRequired,
    allTags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }).isRequired).isRequired,
    error: PropTypes.string,
    onPositionPick: PropTypes.func,
    onModelChange: PropTypes.func.isRequired,
  }

  handleTitleChange = (e) => {
    this.changeModel('title', e.target.value || null);
  }

  handleDescriptionChange = (e) => {
    this.changeModel('description', e.target.value || null);
  }

  handleTakenAtChange = (e) => {
    this.changeModel('takenAt', e.target.value ? new Date(e.target.value) : null);
  }

  handleTagAdded = ({ name }) => {
    if (!this.props.model.tags.includes(name)) {
      this.changeModel('tags', [...this.props.model.tags, name]);
    }
  }

  handleTagDeleted = (i) => {
    const tags = [...this.props.model.tags];
    tags.splice(i, 1);
    this.changeModel('tags', tags);
  }

  changeModel(key, value) {
    this.props.onModelChange({ ...this.props.model, [key]: value });
  }

  render() {
    const { model, allTags, error, onPositionPick } = this.props;
    return (
      <div>
        {error && <Alert bsStyle="danger">{error}</Alert>}
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
              onClick={onPositionPick}
              readOnly
            />
            <InputGroup.Button>
              <Button onClick={onPositionPick}><FontAwesomeIcon icon="dot-circle-o" />Nastaviť pozíciu</Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ReactTags
            placeholder="Tagy"
            tags={model.tags.map(tag => ({ id: tag, name: tag }))}
            suggestions={allTags.map(({ name }) => ({ id: name, name }))}
            handleAddition={this.handleTagAdded}
            handleDelete={this.handleTagDeleted}
            allowNew
          />
        </FormGroup>
      </div>
    );
  }
}

function zeropad(v, n = 2) {
  const raw = `0000${v}`;
  return raw.substring(raw.length - n, raw.length);
}
