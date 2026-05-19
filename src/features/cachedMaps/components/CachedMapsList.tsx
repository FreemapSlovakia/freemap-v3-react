import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Button, ListGroup, Modal, ProgressBar } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
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

export function CachedMapsList(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const activeDownloads = useAppSelector(
    (state) => state.cachedMaps.activeDownloads,
  );

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const totalSize = cachedMaps.reduce((sum, cm) => sum + cm.sizeBytes, 0);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <BiWifiOff /> {m?.offline.offlineMaps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cachedMaps.length === 0 ? (
          <p className="text-muted">{m?.offline.emptyMessage}</p>
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
                    <div className="flex-grow-1 me-2">
                      <div>{cm.name}</div>

                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted text-nowrap">
                          {m?.offline.zoom}:{' '}
                          <strong>
                            {cm.minZoom}&ndash;{cm.maxNativeZoom}
                          </strong>
                          {' · '}
                          {m?.offline.tiles}:{' '}
                          <strong>{nf.format(cm.tileCount)}</strong>
                          {' · '}
                          {m?.offline.size}:{' '}
                          <strong>
                            {formatSize(dl?.sizeBytes ?? cm.sizeBytes)}
                          </strong>
                        </small>

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
                          <>
                            <small> · </small>
                            <small className="text-success">
                              {m?.offline.ready}
                            </small>
                          </>
                        ) : (
                          <>
                            <small> · </small>
                            <small className="text-warning">
                              · {m?.offline.incomplete({ pct })}
                            </small>
                          </>
                        )}
                      </div>
                    </div>

                    {dl && dl.status === 'downloading' && (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          dispatch(cacheTilesPause({ id: cm.type }))
                        }
                        title={m?.offline.pause}
                      >
                        <FaPause />
                      </Button>
                    )}

                    {dl && dl.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          dispatch(cacheTilesResume({ id: cm.type }))
                        }
                        title={m?.offline.resume}
                      >
                        <FaPlay />
                      </Button>
                    )}

                    {dl && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          dispatch(cacheTilesCancel({ id: cm.type }))
                        }
                        title={m?.general.cancel}
                      >
                        <FaTimes />
                      </Button>
                    )}

                    {!dl && !isComplete && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          dispatch(cacheTilesRestart({ id: cm.type }))
                        }
                        title={m?.offline.resume}
                      >
                        <FaPlay />
                      </Button>
                    )}

                    {!dl && (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          const next = window.prompt(m?.general.name, cm.name);

                          if (next != null && next.trim() && next !== cm.name) {
                            dispatch(
                              cachedMapRenamed({
                                id: cm.type,
                                name: next.trim(),
                              }),
                            );
                          }
                        }}
                        title={m?.general.modify}
                      >
                        <FaPencilAlt />
                      </Button>
                    )}

                    {!dl && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          dispatch(cachedMapDeleted({ id: cm.type }))
                        }
                        title={m?.general.delete}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            <div className="text-muted text-end mt-2">
              {m?.offline.total}: {formatSize(totalSize)}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => dispatch(cachedMapsSetView('add'))}
        >
          <FaPlus /> {m?.offline.addOfflineMap}
        </Button>

        <Button variant="dark" onClick={() => dispatch(setActiveModal(null))}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
