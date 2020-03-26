import React, { useState, useMemo } from 'react';
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

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
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

function ExportPdfModalInt({
  onExport,
  onModalClose,
  t,
  language,
  canExportByPolygon,
}: Props) {
  const [area, setArea] = useState('visible');

  const [scale, setScale] = useState(1);

  const [format, setFormat] = useState('jpeg');

  const [contours, setContours] = useState(true);

  const [shadedRelief, setShadedRelief] = useState(true);

  const [hikingTrails, setHikingTrails] = useState(true);

  const [bicycleTrails, setBicycleTrails] = useState(true);

  const [skiTrails, setSkiTrails] = useState(true);

  const [horseTrails, setHorseTrails] = useState(true);

  const nf = useMemo(
    () =>
      Intl.NumberFormat(language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [language],
  );

  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="file-pdf-o" /> {t('more.pdfExport')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="warning">{t('pdfExport.alert')}</Alert>
        <p>{t('pdfExport.area')}</p>
        <ButtonGroup>
          <Button
            active={area === 'visible'}
            onClick={() => setArea('visible')}
          >
            {t('pdfExport.areas.visible')}
          </Button>
          <Button
            active={area === 'infopoints'}
            onClick={() => setArea('infopoints')}
            disabled={!canExportByPolygon}
          >
            {t('pdfExport.areas.pinned')} <FontAwesomeIcon icon="square-o" />
          </Button>
        </ButtonGroup>
        <hr />
        <p>{t('pdfExport.format')}</p>
        <ButtonGroup>
          <Button onClick={() => setFormat('jpeg')} active={format === 'jpeg'}>
            JPEG
          </Button>
          <Button onClick={() => setFormat('png')} active={format === 'png'}>
            PNG
          </Button>
          <Button onClick={() => setFormat('pdf')} active={format === 'pdf'}>
            PDF
          </Button>
          <Button onClick={() => setFormat('svg')} active={format === 'svg'}>
            SVG
          </Button>
        </ButtonGroup>
        <hr />
        <p>{t('pdfExport.layersTitle')}</p>
        <Checkbox
          checked={contours}
          onChange={() => {
            setContours((b) => !b);
          }}
        >
          {t('pdfExport.layers.contours')}
        </Checkbox>
        <Checkbox
          checked={shadedRelief}
          onChange={() => setShadedRelief((b) => !b)}
        >
          {t('pdfExport.layers.shading')}
        </Checkbox>
        <Checkbox
          checked={hikingTrails}
          onChange={() => {
            setHikingTrails((b) => !b);
          }}
        >
          {t('pdfExport.layers.hikingTrails')}
        </Checkbox>
        <Checkbox
          checked={bicycleTrails}
          onChange={() => {
            setBicycleTrails((b) => !b);
          }}
        >
          {t('pdfExport.layers.bicycleTrails')}
        </Checkbox>
        <Checkbox
          checked={skiTrails}
          onChange={() => {
            setSkiTrails((b) => !b);
          }}
        >
          {t('pdfExport.layers.skiTrails')}
        </Checkbox>
        <Checkbox
          checked={horseTrails}
          onChange={() => {
            setHorseTrails((b) => !b);
          }}
        >
          {t('pdfExport.layers.horseTrails')}
        </Checkbox>
        <hr />
        <p>
          {t('pdfExport.mapScale')} {nf.format(scale)}
        </p>
        <Slider
          value={scale}
          min={0.1}
          max={5}
          step={0.05}
          tooltip={false}
          onChange={(scale: number) => {
            setScale(scale);
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            onExport({
              area: area as any,
              scale,
              format: format as any,
              contours,
              shadedRelief,
              hikingTrails,
              bicycleTrails,
              skiTrails,
              horseTrails,
            });
          }}
        >
          <FontAwesomeIcon icon="download" /> {t('gpxExport.export')}
        </Button>{' '}
        <Button onClick={onModalClose}>
          <Glyphicon glyph="remove" /> {t('general.close')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
  canExportByPolygon:
    state.main.selection?.type === 'draw-polygons' &&
    state.main.selection.id !== undefined,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
  onExport(options: PdfExportOptions) {
    dispatch(exportPdf(options));
  },
});

export const ExportPdfModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ExportPdfModalInt));
