import { setActiveModal } from '@app/store/actions.js';
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

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function CachedMapsList(): ReactElement {
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
          <BiWifiOff /> Offline Maps
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cachedMaps.length === 0 ? (
          <p className="text-muted">
            No offline maps cached yet. Add one to use maps without internet
            connection.
          </p>
        ) : (
          <>
            <Table striped bordered responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Zoom</th>
                  <th>Tiles</th>
                  <th>Size</th>
                  <th>Status</th>
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
                          <span className="text-success">Ready</span>
                        ) : (
                          <span className="text-warning">
                            Incomplete ({pct}%)
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
                            title="Pause"
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
                            title="Resume"
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
                            title="Cancel"
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
                            title="Resume"
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
                            title="Delete"
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
              Total: {formatSize(totalSize)}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => dispatch(cachedMapsSetView('add'))}
        >
          <FaPlus /> Add offline map
        </Button>

        <Button variant="dark" onClick={() => dispatch(setActiveModal(null))}>
          Close <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
