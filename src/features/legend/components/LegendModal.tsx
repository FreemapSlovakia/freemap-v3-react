import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { withTickedLayers } from '@features/map/model/layerSetup.js';
import { drawnSetupsSelector } from '@features/map/model/selectors.js';
import {
  drawnTypesSelector,
  integratedLayerDefMapSelector,
  libraryIndexSelector,
  mapByIdSelector,
  mapEntryOf,
  resolvedCustomLayersSelector,
} from '@features/mapLibrary/model/selectors.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerName } from '@shared/layerName.js';
import { RENDERER_ROUTES } from '@shared/mapDefinitions.js';
import { type ReactElement, useMemo, useState } from 'react';
import { Accordion, Modal } from 'react-bootstrap';
import { FaExternalLinkAlt, FaList } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  EXTERNAL_LEGENDS,
  getActiveLegendLayers,
  getWmsLayerDefs,
} from '../legendLayers.js';
import { useLegendMessages } from '../translations/useLegendMessages.js';
import OutdoorMapLegend from './OutdoorMapLegend.js';
import { WmsMapLegend } from './WmsMapLegend.js';

type Props = { show: boolean };

export default function LegendModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const layers = useAppSelector(drawnTypesSelector);

  const customLayers = useAppSelector(resolvedCustomLayersSelector);

  const integratedLayerDefMap = useAppSelector(integratedLayerDefMapSelector);

  const libraryIndex = useAppSelector(libraryIndexSelector);

  const mapById = useAppSelector(mapByIdSelector);

  const resolvedCustomLayers = useAppSelector(resolvedCustomLayersSelector);

  const layerSetups = useAppSelector(drawnSetupsSelector);

  const wmsLayerDefs = useMemo(
    () =>
      getWmsLayerDefs(
        libraryIndex,
        resolvedCustomLayers,
        integratedLayerDefMap,
      ).map((def) => withTickedLayers(def, layerSetups)),
    [libraryIndex, resolvedCustomLayers, integratedLayerDefMap, layerSetups],
  );

  const activeLegendLayers = getActiveLegendLayers(
    layers,
    libraryIndex,
    customLayers,
  );

  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());

  const m = useMessages();

  const lm = useLegendMessages();

  useDocumentTitle(show ? m?.mainMenu.mapLegend : undefined);

  function getSingleLegend(type: string) {
    const variant = RENDERER_ROUTES[type];

    const externalUrl = EXTERNAL_LEGENDS[type];

    // A library map's body may still be loading.
    const wmsDef = wmsLayerDefs.find((def) => def.type === type);

    return externalUrl ? (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        <FaExternalLinkAlt /> {lm?.external}
      </a>
    ) : variant ? (
      <OutdoorMapLegend key={variant} variant={variant} />
    ) : wmsDef ? (
      <WmsMapLegend def={wmsDef} />
    ) : (
      m?.general.loading
    );
  }

  function getHeader(type: string) {
    return layerName(mapEntryOf(mapById[type]) ?? { type }, m) ?? '…';
  }

  return (
    <Modal show={show} onHide={close} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaList /> {m?.mainMenu.mapLegend}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        {activeLegendLayers.length === 1 ? (
          <>
            <div className="mb-3">
              {lm?.body({ name: getHeader(activeLegendLayers[0]) })}
            </div>

            {getSingleLegend(activeLegendLayers[0])}
          </>
        ) : (
          <Accordion
            onSelect={(key) => {
              if (typeof key === 'string') {
                setOpened((prev) => new Set(prev).add(key));
              }
            }}
          >
            {activeLegendLayers.map((type) => (
              <Accordion.Item key={type} eventKey={type}>
                <Accordion.Header>
                  <span>{getHeader(type)}</span>
                </Accordion.Header>

                {/* A collapsed body stays mounted and each legend fetches, so
                    one mounts on first opening and stays to animate closed. */}
                <Accordion.Body>
                  {opened.has(type) && getSingleLegend(type)}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
