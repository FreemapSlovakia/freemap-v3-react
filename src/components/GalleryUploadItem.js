import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import Button from 'react-bootstrap/lib/Button';
import Thumbnail from 'react-bootstrap/lib/Thumbnail';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import { formatGpsCoord } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';

export default class GalleryUploadModal extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    filename: PropTypes.string,
    dataURL: PropTypes.string,
    coords: FmPropTypes.point,
    title: PropTypes.string,
    description: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onTitleChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
  }

  handleRemove = () => {
    this.props.onRemove(this.props.id);
  }

  handlePositionPick = () => {
    this.props.onPositionPick(this.props.id);
  }

  handleTitleChange = (e) => {
    this.props.onTitleChange(this.props.id, e.target.value);
  }

  handleDescriptionChange = (e) => {
    this.props.onDescriptionChange(this.props.id, e.target.value);
  }

  render() {
    const { id, filename, dataURL, coords, title, description } = this.props;
    return (
      <Thumbnail key={id} src={dataURL || require('fm3/images/spinnerbar.gif')} alt={filename}>
        <FormGroup>
          <ControlLabel>Názov</ControlLabel>
          <FormControl type="text" value={title} onChange={this.handleTitleChange} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Popis</ControlLabel>
          <FormControl componentClass="textarea" value={description} onChange={this.handleDescriptionChange} />
        </FormGroup>
        {coords && <p>{formatGpsCoord(coords.lat, 'SN')}, {formatGpsCoord(coords.lon, 'WE')}</p>}
        <Button onClick={this.handlePositionPick}><FontAwesomeIcon icon="dot-circle-o" />Nastaviť pozíciu</Button>
        {' '}
        <Button onClick={this.handleRemove} bsStyle="danger"><FontAwesomeIcon icon="times" />Odstrániť</Button>
      </Thumbnail>
    );
  }
}
