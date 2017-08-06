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
    dataURL: PropTypes.string,
    position: FmPropTypes.point,
    title: PropTypes.string,
    description: PropTypes.string,
    takenAt: PropTypes.instanceOf(Date),
    tags: PropTypes.arrayOf(PropTypes.string.isRequired),
    allTags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    error: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onTitleChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
    onTakenAtChange: PropTypes.func.isRequired,
    onTagsChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }

  handleRemove = () => {
    this.props.onRemove(this.props.id);
  }

  handlePositionPick = () => {
    this.props.onPositionPick(this.props.id);
  }

  handleTitleChange = (e) => {
    this.props.onTitleChange(this.props.id, e.target.value || null);
  }

  handleDescriptionChange = (e) => {
    this.props.onDescriptionChange(this.props.id, e.target.value || null);
  }

  handleTakenAtChange = (e) => {
    this.props.onTakenAtChange(this.props.id, e.target.value ? new Date(e.target.value) : null);
  }

  handleTagAdded = ({ name }) => {
    if (!this.props.tags.includes(name)) {
      this.props.onTagsChange(this.props.id, [...this.props.tags, name]);
    }
  }

  handleTagDeleted = (i) => {
    const newTags = [...this.props.tags];
    newTags.splice(i, 1);
    this.props.onTagsChange(this.props.id, newTags);
  }

  render() {
    const { id, filename, dataURL, position, title, description, disabled, takenAt, tags, allTags, error } = this.props;
    return (
      <Thumbnail key={id} src={dataURL || require('fm3/images/spinnerbar.gif')} alt={filename}>
        {error && <Alert bsStyle="danger">{error}</Alert>}
        <fieldset disabled={disabled}>
          <FormGroup>
            <FormControl placeholder="Názov" type="text" value={title} onChange={this.handleTitleChange} />
          </FormGroup>
          <FormGroup>
            <FormControl placeholder="Popis" componentClass="textarea" value={description} onChange={this.handleDescriptionChange} />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="datetime-local"
              placeholder="Dátum a čas fotenia"
              value={takenAt ? `${zeropad(takenAt.getFullYear(), 4)}-${zeropad(takenAt.getMonth() + 1)}-${zeropad(takenAt.getDate())}T${zeropad(takenAt.getHours())}:${zeropad(takenAt.getMinutes())}:${zeropad(takenAt.getSeconds())}` : ''}
              onChange={this.handleTakenAtChange}
            />
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Pozícia"
                value={position ? `${formatGpsCoord(position.lat, 'SN')}, ${formatGpsCoord(position.lon, 'WE')}` : ''}
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
              tags={tags.map(tag => ({ id: tag, name: tag }))}
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
