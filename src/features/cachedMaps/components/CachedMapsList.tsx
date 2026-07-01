import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapFitBbox, mapToggleLayer } from '@features/map/model/actions.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Button, ListGroup, Modal, ProgressBar } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaCrosshairs,
  FaEye,
  FaPause,
  FaPencilAlt,
  FaPlay,
  FaPlus,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  cachedMapDeleted,
  cachedMapRenamed,
  cachedMapsSetView,
  cacheTilesCancel,
  cacheTilesPause,
  cacheTilesRestart,
  cacheTilesResume,
} from '../model/actions.js';
import { useCachedMapsMessages } from '../translations/useCachedMapsMessages.js';

export function CachedMapsList(): ReactElement {
  const m = useMessages();

  const cmm = useCachedMapsMessages();

  const dispatch = useDispatch();

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const activeDownloads = useAppSelector(
    (state) => state.cachedMaps.activeDownloads,
  );

  const activeLayers = useAppSelector((state) => state.map.layers);

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const totalSize = cachedMaps.reduce((sum, cm) => sum + cm.sizeBytes, 0);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <BiWifiOff /> {m?.mapLayers.offlineMaps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cachedMaps.length === 0 ? (
          <p className="text-muted mb-0">{cmm?.emptyMessage}</p>
        ) : (
          <>
            <ListGroup>
              {cachedMaps.map((cm) => {
                const dl = activeDownloads[cm.type];

                const isComplete = cm.downloadedCount === cm.tileCount;

                const pct = dl
                  ? Math.round((dl.downloaded / dl.total) * 100)
                  : isComplete
                    ? 100
                    : Math.round((cm.downloadedCount / cm.tileCount) * 100);

                return (
                  <ListGroup.Item
                    key={cm.type}
                    className="d-flex align-items-center gap-2"
                  >
                    <div className="flex-grow-1 me-2 min-w-0">
                      <div>{cm.name}</div>

                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <small className="text-muted">
                          <span className="text-nowrap">
                            {cmm?.zoom}:{' '}
                            <strong>
                              {cm.minZoom}&ndash;{cm.maxNativeZoom}
                            </strong>
                            {' · '}
                          </span>{' '}
                          <span className="text-nowrap">
                            {cmm?.tiles}:{' '}
                            <strong>{nf.format(cm.tileCount)}</strong>
                            {' · '}
                          </span>{' '}
                          <span className="text-nowrap">
                            {cmm?.size}:{' '}
                            <strong>
                              {formatSize(dl?.sizeBytes ?? cm.sizeBytes)}
                            </strong>
                          </span>
                        </small>

                        <small> · </small>

                        {dl ? (
                          <ProgressBar
                            now={pct}
                            label={`${pct}%`}
                            animated={dl.status === 'downloading'}
                            variant={
                              dl.status === 'error' ? 'danger' : undefined
                            }
                            className="flex-grow-1"
                            style={{ minWidth: 80 }}
                          />
                        ) : isComplete ? (
                          <small className="text-success">{cmm?.ready}</small>
                        ) : (
                          <small className="text-warning">
                            {cmm?.incomplete({ pct })}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <ResponsiveActions
                        align="end"
                        toggleLabel={m?.general.actions}
                      >
                        <Action
                          icon={<FaCrosshairs />}
                          label={cmm?.focus}
                          onClick={() =>
                            dispatch(
                              mapFitBbox({
                                bbox: cm.bounds,
                                maxZoom: cm.maxNativeZoom,
                              }),
                            )
                          }
                          showFrom="sm"
                        />

                        {!dl && isComplete && (
                          <Action
                            icon={<FaEye />}
                            label={cmm?.activate}
                            variant={
                              activeLayers.includes(cm.type)
                                ? 'primary'
                                : 'outline-primary'
                            }
                            active={activeLayers.includes(cm.type)}
                            onClick={() =>
                              dispatch(mapToggleLayer({ type: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        {dl && dl.status === 'downloading' && (
                          <Action
                            icon={<FaPause />}
                            label={cmm?.pause}
                            onClick={() =>
                              dispatch(cacheTilesPause({ id: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        {dl && dl.status === 'paused' && (
                          <Action
                            icon={<FaPlay />}
                            label={cmm?.resume}
                            onClick={() =>
                              dispatch(cacheTilesResume({ id: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        {dl && (
                          <Action
                            icon={<FaTimes />}
                            label={m?.general.cancel}
                            variant="danger"
                            onClick={() =>
                              dispatch(cacheTilesCancel({ id: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        {!dl && !isComplete && (
                          <Action
                            icon={<FaPlay />}
                            label={cmm?.resume}
                            onClick={() =>
                              dispatch(cacheTilesRestart({ id: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        {!dl && <ActionDivider />}

                        {!dl && (
                          <Action
                            icon={<FaPencilAlt />}
                            label={m?.general.modify}
                            onClick={() => {
                              const next = window.prompt(
                                m?.general.name,
                                cm.name,
                              );

                              if (
                                next != null &&
                                next.trim() &&
                                next !== cm.name
                              ) {
                                dispatch(
                                  cachedMapRenamed({
                                    id: cm.type,
                                    name: next.trim(),
                                  }),
                                );
                              }
                            }}
                            showFrom="sm"
                          />
                        )}

                        {!dl && (
                          <Action
                            icon={<FaTrash />}
                            label={m?.general.delete}
                            variant="danger"
                            onClick={() =>
                              dispatch(cachedMapDeleted({ id: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}
                      </ResponsiveActions>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            <div className="text-muted text-end mt-2">
              {cmm?.total}: {formatSize(totalSize)}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => dispatch(cachedMapsSetView('add'))}
        >
          <FaPlus /> {cmm?.addOfflineMap}
        </Button>

        <Button variant="dark" onClick={() => dispatch(setActiveModal(null))}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
