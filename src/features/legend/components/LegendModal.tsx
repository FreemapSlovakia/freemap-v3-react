import { type ReactElement, useCallback, useMemo } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import { FaList, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../../actions/mainActions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useMessages } from '../../../l10nInjector.js';
import {
  integratedLayerDefs,
  IsWmsLayerDef,
  LayerDef,
} from '../../../mapDefinitions.js';
import LegacyMapsLegend from './LegacyMapsLegend.js';
import OutdoorMapLegend from './OutdoorMapLegend.js';
import { WmsMapLegend } from './WmsMapLegend.js';

type Props = { show: boolean };

export default LegendModal;

export function LegendModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const layers = useAppSelector((state) => state.map.layers);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const wmsLayerDefs = useMemo(
    () =>
      [...customLayers, ...integratedLayerDefs].filter(
        (def): def is LayerDef<IsWmsLayerDef, IsWmsLayerDef> =>
          def.technology === 'wms',
      ),
    [customLayers],
  );

  const legendLayers = useMemo(
    () =>
      new Set([
        'A',
        'T',
        'C',
        'K',
        'X',
        ...wmsLayerDefs.map((def) => def.type),
      ]),

    [wmsLayerDefs],
  );

  const activeLegendLayers = layers.filter((layer) => legendLayers.has(layer));

  const m = useMessages();

  function getSingleLegend(type: string) {
    return type === 'X' ? (
      <OutdoorMapLegend />
    ) : ['A', 'T', 'C', 'K'].includes(type) ? (
      <LegacyMapsLegend />
    ) : (
      <WmsMapLegend def={wmsLayerDefs.find((def) => def.type === type)!} />
    );
  }

  function getHeader(type: string) {
    return (
      m?.mapLayers.letters[type] ??
      customLayers.find((def) => def.type === type)?.name ??
      '…'
    );
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaList /> {m?.mainMenu.mapLegend}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {activeLegendLayers.length === 1 ? (
          <>
            <div className="mb-3">
              {m?.legend.body({ name: getHeader(activeLegendLayers[0]) })}
            </div>

            {getSingleLegend(activeLegendLayers[0])}
          </>
        ) : (
          <Accordion>
            {activeLegendLayers.map((type) => (
              <Accordion.Item key={type} eventKey={type}>
                <Accordion.Header>
                  <span>{getHeader(type)}</span>
                </Accordion.Header>

                <Accordion.Body>{getSingleLegend(type)}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
