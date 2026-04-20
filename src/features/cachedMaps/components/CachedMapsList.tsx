import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Button, Modal, ProgressBar, Table } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaPause, FaPlay, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  cachedMapDeleted,
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
            <Table striped bordered responsive>
              <thead>
                <tr>
                  <th>{m?.general.name}</th>
                  <th>{m?.offline.zoom}</th>
                  <th>{m?.offline.tiles}</th>
                  <th>{m?.offline.size}</th>
                  <th>{m?.offline.status}</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {cachedMaps.map((cm) => {
                  const dl = activeDownloads[cm.type];

                  const isComplete = cm.downloadedCount === cm.tileCount;

                  const pct = dl
                    ? Math.round((dl.downloaded / dl.total) * 100)
                    : isComplete
                      ? 100
                      : Math.round((cm.downloadedCount / cm.tileCount) * 100);

                  return (
                    <tr key={cm.type}>
                      <td>{cm.name}</td>
                      <td>
                        {cm.minZoom}&ndash;{cm.maxNativeZoom}
                      </td>
                      <td>{nf.format(cm.tileCount)}</td>
                      <td>{formatSize(dl?.sizeBytes ?? cm.sizeBytes)}</td>
                      <td style={{ minWidth: 120 }}>
                        {dl ? (
                          <ProgressBar
                            now={pct}
                            label={`${pct}%`}
                            animated={dl.status === 'downloading'}
                            variant={
                              dl.status === 'error' ? 'danger' : undefined
                            }
                          />
                        ) : isComplete ? (
                          <span className="text-success">
                            {m?.offline.ready}
                          </span>
                        ) : (
                          <span className="text-warning">
                            {m?.offline.incomplete({ pct })}
                          </span>
                        )}
                      </td>
                      <td className="text-nowrap">
                        {dl && dl.status === 'downloading' && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-1"
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
                            className="me-1"
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
                            className="me-1"
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
                            className="me-1"
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
                            variant="outline-danger"
                            onClick={() =>
                              dispatch(cachedMapDeleted({ id: cm.type }))
                            }
                            title={m?.general.delete}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="text-muted text-end">
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
