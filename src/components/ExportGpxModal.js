import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal, exportGpx } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

const exportableDefinitions = [
  // { type: 'search', icon: 'search', name: 'výsledok hľadania' },
  { type: 'plannedRoute', icon: 'map-signs' },
  { type: 'objects', icon: 'map-marker' },
  { type: 'pictures', icon: 'picture-o' },
  { type: 'distanceMeasurement', icon: 'arrows-h' },
  { type: 'areaMeasurement', icon: 'square' },
  { type: 'elevationMeasurement', icon: 'long-arrow-up' },
  { type: 'infoPoint', icon: 'thumb-tack' },
  // { type: 'changesets', icon: 'pencil', name: 'zmeny v mape' },
  // { type: 'mapDetils', icon: 'info', name: 'detaily v mape' },
];

export class ExportGpxModal extends React.Component {
  static propTypes = {
    exportables: PropTypes.arrayOf(PropTypes.oneOf(exportableDefinitions.map(({ type }) => type)).isRequired).isRequired,
    onExport: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  state = {
    exportables: null,
  }

  static getDerivedStateFromProps(props, state) {
    return state.exportables ? null : {
      exportables: props.exportables,
    };
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
    const { onModalClose, exportables, t } = this.props;

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="share" /> {t('more.gpxExport')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="warning">
            {t('gpxExport.disabledAlert')}
          </Alert>
          {
            exportableDefinitions.map(({ type, icon }) => (
              <Checkbox
                key={type}
                checked={this.state.exportables.includes(type)}
                disabled={!exportables.includes(type)}
                onChange={() => this.handleCheckboxChange(type)}
              >
                {t('gpxExport.export')} <FontAwesomeIcon icon={icon} /> {t(`gpxExport.what.${type}`)}
              </Checkbox>
            ))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleExportClick} disabled={!this.state.exportables.length}>
            <FontAwesomeIcon icon="share" /> {t('gpxExport.export')}
          </Button>
          {' '}
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    (state) => {
      const exportables = [];
      if (state.search.selectedResult) {
        // exportables.push('search');
      }
      if (state.routePlanner.alternatives.length) {
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
      if (state.infoPoint.points.length) {
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
  ),
)(ExportGpxModal);
