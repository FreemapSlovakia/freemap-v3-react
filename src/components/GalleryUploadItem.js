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

export default class GalleryUploadItem extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    filename: PropTypes.string,
    dataURL: PropTypes.string,
    position: FmPropTypes.point,
    title: PropTypes.string,
    description: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onPositionPick: PropTypes.func.isRequired,
    onTitleChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
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

  render() {
    const { id, filename, dataURL, position, title, description, disabled } = this.props;
    return (
      <Thumbnail key={id} src={dataURL || require('fm3/images/spinnerbar.gif')} alt={filename}>
        <fieldset disabled={disabled}>
          <FormGroup>
            <ControlLabel>Názov</ControlLabel>
            <FormControl type="text" value={title} onChange={this.handleTitleChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Popis</ControlLabel>
            <FormControl componentClass="textarea" value={description} onChange={this.handleDescriptionChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Kategória</ControlLabel>
            <FormControl componentClass="select" placeholder="Kategória">
              <option value="" />
              <option value="guidepost">Rázcestníky</option>
              <option value="nature">Príroda</option>
              <option value="doc">Dokumentačné</option>
            </FormControl>
          </FormGroup>
          {position && <p>{formatGpsCoord(position.lat, 'SN')}, {formatGpsCoord(position.lon, 'WE')}</p>}
          <Button onClick={this.handlePositionPick}><FontAwesomeIcon icon="dot-circle-o" />Nastaviť pozíciu</Button>
          {' '}
          <Button onClick={this.handleRemove} bsStyle="danger"><FontAwesomeIcon icon="times" />Odstrániť</Button>
        </fieldset>
      </Thumbnail>
    );
  }
}
