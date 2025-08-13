import { type ReactElement, useCallback, useMemo } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import { FaRegMap, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { CustomLayerDef, IsWmsLayerDef } from '../mapDefinitions.js';
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

  const wmsCustomLayerDefs = useMemo(
    () =>
      customLayers.filter(
        (def): def is CustomLayerDef<IsWmsLayerDef> => def.technology === 'wms',
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
        ...wmsCustomLayerDefs.map((def) => def.type),
      ]),

    [wmsCustomLayerDefs],
  );

  const activeLegendLayers = layers.filter((layer) => legendLayers.has(layer));

  const m = useMessages();

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegMap /> {m?.mainMenu.mapLegend}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Accordion>
          {activeLegendLayers.map((type) => (
            <Accordion.Item key={type} eventKey={type}>
              <Accordion.Header>
                <span>
                  {m?.legend.body({
                    name:
                      m?.mapLayers.letters[type] ??
                      customLayers.find((def) => def.type === type)?.name ??
                      '…',
                  })}
                </span>
              </Accordion.Header>

              <Accordion.Body>
                {type === 'X' ? (
                  <OutdoorMapLegend />
                ) : ['A', 'T', 'C', 'K'].includes(type) ? (
                  <LegacyMapsLegend />
                ) : (
                  <WmsMapLegend
                    def={wmsCustomLayerDefs.find((def) => def.type === type)!}
                  />
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
