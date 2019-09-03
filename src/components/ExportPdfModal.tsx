import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Alert from 'react-bootstrap/lib/Alert';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import {
  setActiveModal,
  exportPdf,
  PdfExportOptions,
} from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

type State = PdfExportOptions;

export class ExportPdfModal extends React.Component<Props, State> {
  state: State = {
    contours: true,
    shadedRelief: true,
    hikingTrails: true,
    bicycleTrails: true,
    skiTrails: true,
    horseTrails: true,
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

  handleHorseTrailsChange = () => {
    this.setState(s => ({
      horseTrails: !s.horseTrails,
    }));
  };

  handleScaleChange = (scale: number) => {
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
            <FontAwesomeIcon icon="file-pdf-o" /> {t('pdfExport.title')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="warning">{t('pdfExport.alert')}</Alert>
          <p>{t('pdfExport.area')}</p>
          <ButtonGroup>
            <Button
              active={this.state.area === 'visible'}
              onClick={() => this.setState({ area: 'visible' })}
            >
              {t('pdfExport.areas.visible')}
            </Button>
            <Button
              active={this.state.area === 'infopoints'}
              onClick={() => this.setState({ area: 'infopoints' })}
              disabled={!hasInfopoints}
            >
              {t('pdfExport.areas.pinned')}{' '}
              <FontAwesomeIcon icon="thumb-tack" />
            </Button>
          </ButtonGroup>
          <hr />
          <p>{t('pdfExport.layersTitle')}</p>
          <Checkbox
            checked={this.state.contours}
            onChange={this.handleContoursChange}
          >
            {t('pdfExport.layers.contours')}
          </Checkbox>
          <Checkbox
            checked={this.state.shadedRelief}
            onChange={this.handleShadedReliefChange}
          >
            {t('pdfExport.layers.shading')}
          </Checkbox>
          <Checkbox
            checked={this.state.hikingTrails}
            onChange={this.handleHikingTrailsChange}
          >
            {t('pdfExport.layers.hikingTrails')}
          </Checkbox>
          <Checkbox
            checked={this.state.bicycleTrails}
            onChange={this.handleBicycleTrailsChange}
          >
            {t('pdfExport.layers.bicycleTrails')}
          </Checkbox>
          <Checkbox
            checked={this.state.skiTrails}
            onChange={this.handleSkiTrailsChange}
          >
            {t('pdfExport.layers.skiTrails')}
          </Checkbox>
          <Checkbox
            checked={this.state.horseTrails}
            onChange={this.handleHorseTrailsChange}
          >
            {t('pdfExport.layers.horseTrails')}
          </Checkbox>
          <hr />
          <p>
            {' '}
            {t('pdfExport.mapScale')} {nf.format(this.state.scale)}
          </p>
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

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
  hasInfopoints: state.infoPoint.points.length > 1,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
  onExport(options: PdfExportOptions) {
    dispatch(exportPdf(options));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ExportPdfModal));
