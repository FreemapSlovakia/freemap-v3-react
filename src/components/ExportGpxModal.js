import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal, exportGpx } from 'fm3/actions/mainActions';

const exportableDefinitions = [
  // { type: 'search', icon: 'search', name: 'výsledok hľadania' },
  { type: 'plannedRoute', icon: 'map-signs', name: 'vyhľadanú trasu' },
  { type: 'objects', icon: 'map-marker', name: 'miesta' },
  { type: 'pictures', icon: 'picture-o', name: 'fotografie (vo viditeľnej časti mapy)' },
  { type: 'distanceMeasurement', icon: 'arrows-h', name: 'meranie vzdialenosti' },
  { type: 'areaMeasurement', icon: 'square', name: 'meranie plochy' },
  { type: 'elevationMeasurement', icon: 'long-arrow-up', name: 'meranie výšky a polohy' },
  { type: 'infoPoint', icon: 'thumb-tack', name: 'bod v mape' },
  // { type: 'changesets', icon: 'pencil', name: 'zmeny v mape' },
  // { type: 'mapDetils', icon: 'info', name: 'detaily v mape' },
];

export class EmbedMapModal extends React.Component {
  static propTypes = {
    exportables: PropTypes.arrayOf(PropTypes.oneOf(exportableDefinitions.map(({ type }) => type)).isRequired).isRequired,
    onExport: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
  };

  state = {
    exportables: [],
  }

  componentWillMount() {
    this.setState({
      exportables: this.props.exportables,
    });
  }

  setFormControl = (textarea) => {
    this.textarea = textarea;
    if (textarea) {
      textarea.select();
    }
  }

  handleExportClick = () => {
    this.props.onExport(this.state.exportables);
  }

  handleCheckboxChange = (type) => {
    const set = new Set(this.state.exportables);
    if (this.state.exportables.includes(type)) {
      set.delete(type);
    } else {
      set.add(type);
    }
    this.setState({ exportables: [...set] });
  }

  render() {
    const { onModalClose, exportables } = this.props;

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="share" /> Exportovať do GPX
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            exportableDefinitions.map(({ type, icon, name }) => (
              <Checkbox
                key={type}
                checked={this.state.exportables.includes(type)}
                disabled={!exportables.includes(type)}
                onChange={() => this.handleCheckboxChange(type)}
              >
                Exportovať <FontAwesomeIcon icon={icon} /> {name}
              </Checkbox>
            ))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleExportClick} disabled={!this.state.exportables.length}>
            <FontAwesomeIcon icon="share" /> Exportovať
          </Button>
          {' '}
          <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  (state) => {
    const exportables = [];
    if (state.search.selectedResult) {
      // exportables.push('search');
    }
    if (state.routePlanner.shapePoints) {
      exportables.push('plannedRoute');
    }
    if (state.objects.objects.length) {
      exportables.push('objects');
    }
    if (state.map.overlays.includes('I')) {
      exportables.push('pictures');
    }
    if (state.areaMeasurement.points.length) {
      exportables.push('areaMeasurement');
    }
    if (state.distanceMeasurement.points.length) {
      exportables.push('distanceMeasurement');
    }
    if (state.elevationMeasurement.point) {
      exportables.push('elevationMeasurement');
    }
    if (state.infoPoint.lat && state.infoPoint.lon) {
      exportables.push('infoPoint');
    }
    if (state.changesets.changesets.length) {
      // exportables.push('changesets');
    }
    if (state.mapDetails.trackInfoPoints) {
      // exportables.push('mapDetails');
    }

    return {
      exportables,
    };
  },
  dispatch => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
    onExport(exportables) {
      dispatch(exportGpx(exportables));
    },
  }),
)(EmbedMapModal);
