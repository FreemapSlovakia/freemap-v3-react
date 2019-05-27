import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Alert from 'react-bootstrap/lib/Alert';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal, exportPdf } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

export class ExportPdfModal extends React.Component {
  static propTypes = {
    onExport: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    language: PropTypes.string,
    hasInfopoints: PropTypes.bool,
  };

  state = {
    contours: true,
    shadedRelief: true,
    hikingTrails: true,
    bicycleTrails: true,
    skiTrails: true,
    scale: 1,
    area: 'visible',
  };

  handleExportClick = () => {
    this.props.onExport(this.state);
  };

  handleContoursChange = () => {
    this.setState(s => ({
      contours: !s.contours,
    }));
  };

  handleShadedReliefChange = () => {
    this.setState(s => ({
      shadedRelief: !s.shadedRelief,
    }));
  };

  handleHikingTrailsChange = () => {
    this.setState(s => ({
      hikingTrails: !s.hikingTrails,
    }));
  };

  handleBicycleTrailsChange = () => {
    this.setState(s => ({
      bicycleTrails: !s.bicycleTrails,
    }));
  };

  handleSkiTrailsChange = () => {
    this.setState(s => ({
      skiTrails: !s.skiTrails,
    }));
  };

  handleScaleChange = scale => {
    this.setState({ scale });
  };

  render() {
    const { onModalClose, t, language, hasInfopoints } = this.props;
    const nf = Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="file-pdf-o" /> Exportovať do PDF
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="warning">
            Upozornenia:
            <ul>
              <li>
                Toto je experimentálna funkcia <FontAwesomeIcon icon="flask" />.
              </li>
              <li>
                Exportuje sa experimentálna outdoorova mapa bez možných
                dodatočných prvkov.
              </li>
              <li>Export mapy do PDF môže trvať aj desiatky sekúnd.</li>
              <li>
                Do publikovanej mapy je nutné uviesť jej licenciu:
                <br />
                mapa ©{' '}
                <a
                  href="https://www.freemap.sk/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Freemap Slovakia
                </a>
                , dáta{' '}
                <a
                  href="https://osm.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  © prispievatelia OpenStreetMap
                </a>
                , © SRTM
              </li>
            </ul>
          </Alert>
          <p>Exportovať oblasť:</p>
          <ButtonGroup>
            <Button
              active={this.state.area === 'visible'}
              onClick={() => this.setState({ area: 'visible' })}
            >
              Viditeľnú oblasť mapy
            </Button>
            <Button
              active={this.state.area === 'infopoints'}
              onClick={() => this.setState({ area: 'infopoints' })}
              disabled={!hasInfopoints}
            >
              Plochu ohraničenú bodmi v mape{' '}
              <FontAwesomeIcon icon="thumb-tack" />
            </Button>
          </ButtonGroup>
          <hr />
          <p>Voliteľné vrstvy:</p>
          <Checkbox
            checked={this.state.contours}
            onChange={this.handleContoursChange}
          >
            Vrstevnice
          </Checkbox>
          <Checkbox
            checked={this.state.shadedRelief}
            onChange={this.handleShadedReliefChange}
          >
            Tieňovaný reliéf
          </Checkbox>
          <Checkbox
            checked={this.state.hikingTrails}
            onChange={this.handleHikingTrailsChange}
          >
            Turistické trasy
          </Checkbox>
          <Checkbox
            checked={this.state.bicycleTrails}
            onChange={this.handleBicycleTrailsChange}
          >
            Cyklotrasy
          </Checkbox>
          <Checkbox
            checked={this.state.skiTrails}
            onChange={this.handleSkiTrailsChange}
          >
            Lyžiarské trasy
          </Checkbox>
          <hr />
          <p>Mierka mapy: {nf.format(this.state.scale)}</p>
          <Slider
            value={this.state.scale}
            min={0.1}
            max={5}
            step={0.05}
            tooltip={false}
            onChange={this.handleScaleChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleExportClick}>
            <FontAwesomeIcon icon="share" /> {t('gpxExport.export')}
          </Button>{' '}
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
    state => ({
      language: state.l10n.language,
      hasInfopoints: state.infoPoint.points.length > 1,
    }),
    dispatch => ({
      onModalClose() {
        dispatch(setActiveModal(null));
      },
      onExport(settings) {
        dispatch(exportPdf(settings));
      },
    }),
  ),
)(ExportPdfModal);
